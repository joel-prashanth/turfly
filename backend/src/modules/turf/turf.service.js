const prisma = require("../../config/prisma");
const uploadService = require("../upload/upload.service");

const createTurf = async (turfData) => {
  const {
    name,
    description,
    location,
    pricePerHour,
    sport,
    imageUrl,
    ownerId,
  } = turfData;

  if (!name || !location || !pricePerHour || !sport) {
    throw new Error("Name, location, price per hour and sport are required.");
  }

  if (Number(pricePerHour) <= 0) {
    throw new Error("Price per hour must be greater than 0.");
  }

  const newTurf = await prisma.turf.create({
    data: {
      name,
      description,
      location,
      pricePerHour: Number(pricePerHour),
      sport,
      imageUrl,
      ownerId,
    },
  });

  return newTurf;
};

const getMyTurfs = async (ownerId) => {
  return prisma.turf.findMany({
    where: {
      ownerId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getAllTurfs = async (filters = {}) => {
  const { search, location, sport, minPrice, maxPrice, sort, limit } = filters;

  const where = {
    isActive: true,
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
    ...(limit && {
      take: Number(limit),
    }),
  });
};
const getTurfById = async (turfId) => {
  if (!turfId) {
    throw new Error("Turf id is required.");
  }

  const turf = await prisma.turf.findUnique({
    where: {
      id: turfId,
    },
  });

  if (!turf) {
    throw new Error("Turf not found.");
  }

  return turf;
};

const deleteTurf = async (turfId, ownerId) => {
  const turf = await prisma.turf.findUnique({
    where: {
      id: turfId,
    },
    include: {
      slots: {
        include: {
          booking: true,
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

  const hasBookings = turf.slots.some((slot) => slot.booking !== null);

  if (hasBookings) {
    throw new Error("This turf has active bookings and cannot be deleted.");
  }

  // Delete Cloudinary image first
  if (turf.imagePublicId) {
    try {
      await uploadService.deleteImage(turf.imagePublicId);
    } catch (error) {
      console.error("Failed to delete Cloudinary image:", error);
    }
  }

  await prisma.$transaction([
    prisma.slot.deleteMany({
      where: {
        turfId,
      },
    }),

    prisma.turf.delete({
      where: {
        id: turfId,
      },
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
  } = turfData;

  if (!name || !location || !sport) {
    throw new Error("Name, location and sport are required.");
  }

  if (Number(pricePerHour) <= 0) {
    throw new Error("Price per hour must be greater than 0.");
  }

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

module.exports = {
  createTurf,
  getMyTurfs,
  getAllTurfs,
  getTurfById,
  updateTurf,
  deleteTurf,
};
