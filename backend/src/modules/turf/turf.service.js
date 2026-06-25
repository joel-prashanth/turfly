const prisma = require("../../config/prisma");
const uploadService = require("../upload/upload.service");
const {
  releaseExpiredBookings,
} = require("../bookings/bookingLifecycle.service");

const createTurf = async (turfData) => {
  const {
    name,
    description,
    location,
    pricePerHour,
    sport,
    imageUrl,
    ownerId,
    cancellationWindowHours,
  } = turfData;

  if (!name || !location || !pricePerHour || !sport) {
    throw new Error("Name, location, price per hour and sport are required.");
  }

  if (Number(pricePerHour) <= 0) {
    throw new Error("Price per hour must be greater than 0.");
  }

  const windowHours = cancellationWindowHours !== undefined ? Number(cancellationWindowHours) : 24;
  if (windowHours < 0) throw new Error("Cancellation window cannot be negative.");

  const newTurf = await prisma.turf.create({
    data: {
      name,
      description,
      location,
      pricePerHour: Number(pricePerHour),
      sport,
      imageUrl,
      ownerId,
      cancellationWindowHours: windowHours,
    },
  });

  return newTurf;
};

const getMyTurfs = async (ownerId) => {
  const now = new Date();

  const turfs = await prisma.turf.findMany({
    where: { ownerId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          slots: {
            where: {
              endTime: { gt: now },
              bookings: {
                some: { status: "CONFIRMED" },
              },
            },
          },
        },
      },
    },
  });

  return turfs.map((turf) => ({
    ...turf,
    upcomingBookedSlots: turf._count.slots,
    _count: undefined,
  }));
};

const getAllTurfs = async (filters = {}) => {
  const { search, location, sport, minPrice, maxPrice, sort, limit } = filters;

  const where = {
    isActive: true,
    owner: { ownerStatus: "ACTIVE" },
  };

  if (sport) {
    where.sport = sport;
  }

  if (location) {
    where.location = {
      contains: location,
      mode: "insensitive",
    };
  }

  if (search) {
    where.OR = [
      {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        location: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  if (minPrice || maxPrice) {
    where.pricePerHour = {};

    if (minPrice) {
      where.pricePerHour.gte = Number(minPrice);
    }

    if (maxPrice) {
      where.pricePerHour.lte = Number(maxPrice);
    }
  }

  let orderBy = {
    createdAt: "desc",
  };

  switch (sort) {
    case "priceAsc":
      orderBy = {
        pricePerHour: "asc",
      };
      break;

    case "priceDesc":
      orderBy = {
        pricePerHour: "desc",
      };
      break;

    case "newest":
      orderBy = {
        createdAt: "desc",
      };
      break;

    default:
      break;
  }

  return prisma.turf.findMany({
    where,
    orderBy,
    ...(limit && { take: Number(limit) }),
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          businessName: true,
          paymentQrUrl: true,
        },
      },
    },
  });
};

const getTurfById = async (turfId) => {
  if (!turfId) {
    throw new Error("Turf id is required.");
  }

  const turf = await prisma.turf.findUnique({
    where: { id: turfId },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          businessName: true,
          paymentQrUrl: true,
        },
      },
    },
  });

  if (!turf) {
    throw new Error("Turf not found.");
  }

  return turf;
};

const deleteTurf = async (turfId, ownerId) => {
  await releaseExpiredBookings();

  const turf = await prisma.turf.findUnique({
    where: {
      id: turfId,
    },

    include: {
      slots: {
        include: {
          bookings: {
            where: { status: "CONFIRMED" },
            select: { status: true },
          },
        },
      },
    },
  });

  if (!turf) {
    throw new Error("Turf not found.");
  }

  if (turf.ownerId !== ownerId) {
    throw new Error("You are not authorized to delete this turf.");
  }

  if (turf.imagePublicId) {
    try {
      await uploadService.deleteImage(turf.imagePublicId);
    } catch (error) {
      console.error("Failed to delete Cloudinary image:", error);
    }
  }

  const now = new Date();

  await prisma.$transaction([
    // Cancel any upcoming confirmed/pending bookings (preserve history)
    prisma.booking.updateMany({
      where: {
        slot: { turfId, endTime: { gt: now } },
        status: { in: ["CONFIRMED", "PENDING"] },
      },
      data: {
        status: "CANCELLED",
        cancelledAt: now,
      },
    }),

    // Delete payments then bookings (FK order)
    prisma.payment.deleteMany({
      where: { booking: { slot: { turfId } } },
    }),

    prisma.booking.deleteMany({
      where: { slot: { turfId } },
    }),

    prisma.slot.deleteMany({
      where: { turfId },
    }),

    prisma.turf.delete({
      where: { id: turfId },
    }),
  ]);

  return {
    message: "Turf deleted successfully.",
  };
};

const updateTurf = async (turfId, ownerId, turfData) => {
  const turf = await prisma.turf.findUnique({
    where: {
      id: turfId,
    },
  });

  if (!turf) {
    throw new Error("Turf not found.");
  }

  if (turf.ownerId !== ownerId) {
    throw new Error("You are not authorized to edit this turf.");
  }

  const {
    name,
    description,
    location,
    pricePerHour,
    sport,
    imageUrl,
    imagePublicId,
    isActive,
    cancellationWindowHours,
  } = turfData;

  if (!name || !location || !sport) {
    throw new Error("Name, location and sport are required.");
  }

  if (Number(pricePerHour) <= 0) {
    throw new Error("Price per hour must be greater than 0.");
  }

  const windowHours = cancellationWindowHours !== undefined ? Number(cancellationWindowHours) : turf.cancellationWindowHours;
  if (windowHours < 0) throw new Error("Cancellation window cannot be negative.");

  const oldPublicId = turf.imagePublicId;

  const updatedTurf = await prisma.turf.update({
    where: {
      id: turfId,
    },
    data: {
      name,
      description,
      location,
      pricePerHour: Number(pricePerHour),
      sport,
      imageUrl,
      imagePublicId,
      isActive,
      cancellationWindowHours: windowHours,
    },
  });

  const imageChanged =
    oldPublicId && imagePublicId && oldPublicId !== imagePublicId;

  if (imageChanged) {
    try {
      await uploadService.deleteImage(oldPublicId);
    } catch (error) {
      console.error("Failed to delete old Cloudinary image:", error);
    }
  }

  return updatedTurf;
};

const setListingStatus = async (turfId, ownerId, isActive) => {
  const turf = await prisma.turf.findUnique({ where: { id: turfId } });

  if (!turf) throw new Error("Turf not found.");
  if (turf.ownerId !== ownerId) throw new Error("Not authorized.");

  return prisma.turf.update({
    where: { id: turfId },
    data: { isActive },
  });
};

module.exports = {
  createTurf,
  getMyTurfs,
  getAllTurfs,
  getTurfById,
  updateTurf,
  deleteTurf,
  setListingStatus,
};