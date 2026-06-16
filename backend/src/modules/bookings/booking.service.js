const prisma = require("../../config/prisma");
const { releaseExpiredBookings } = require("./bookingLifecycle.service");

const createBooking = async (slotId, playerId) => {
  if (!slotId) {
    throw new Error("Slot id is required");
  }

  await releaseExpiredBookings();

  const player = await prisma.user.findUnique({
    where: {
      id: playerId,
    },
  });

  if (!player) {
    throw new Error("Player not found");
  }

  if (player.role !== "PLAYER") {
    throw new Error("Only players can book slots");
  }

  const booking = await prisma.$transaction(async (tx) => {
    const slot = await tx.slot.findUnique({
      where: {
        id: slotId,
      },
      include: {
        booking: true,
      },
    });

    if (!slot) {
      throw new Error("Slot not found");
    }

    if (slot.startTime <= new Date()) {
      throw new Error("Bookings close once a slot begins.");
    }

    if (slot.status !== "AVAILABLE") {
      throw new Error("Only available slots can be booked");
    }

    if (slot.booking) {
      throw new Error("Slot has already been booked");
    }

    const newBooking = await tx.booking.create({
      data: {
        slotId,
        playerId,
        status: "CONFIRMED",
      },
    });

    await tx.slot.update({
      where: {
        id: slotId,
      },
      data: {
        status: "BOOKED",
      },
    });

    return newBooking;
  });

  return booking;
};

const getMyBookings = async (playerId) => {
  await releaseExpiredBookings();

  return prisma.booking.findMany({
    where: {
      playerId,
    },

    orderBy: {
      createdAt: "desc",
    },

    include: {
      slot: {
        include: {
          turf: {
            select: {
              id: true,
              name: true,
              description: true,
              location: true,
              sport: true,
              pricePerHour: true,
              imageUrl: true,
              isActive: true,

              owner: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                },
              },
            },
          },
        },
      },
    },
  });
};

const cancelBooking = async (bookingId, playerId) => {
  await releaseExpiredBookings();

  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },

    include: {
      slot: true,
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.playerId !== playerId) {
    throw new Error("You are not authorized to cancel this booking");
  }

  if (booking.status === "CANCELLED") {
    throw new Error("Booking is already cancelled");
  }

  if (booking.status === "COMPLETED") {
    throw new Error("Completed bookings cannot be cancelled");
  }

  await prisma.$transaction(async (tx) => {
    await tx.booking.update({
      where: {
        id: bookingId,
      },
      data: {
        status: "CANCELLED",
      },
    });

    await tx.slot.update({
      where: {
        id: booking.slotId,
      },
      data: {
        status: "AVAILABLE",
      },
    });
  });

  return {
    message: "Booking cancelled successfully",
  };
};

const getOwnerBookings = async (ownerId, query) => {
  await releaseExpiredBookings();

  const { page = 1, limit = 10, search = "", status = "ALL" } = query;

  const skip = (Number(page) - 1) * Number(limit);

  const where = {
    slot: {
      turf: {
        ownerId,
      },
    },
  };

  // Status Filter
  if (status !== "ALL") {
    if (status === "UPCOMING") {
      where.status = "CONFIRMED";
    } else {
      where.status = status;
    }
  }

  // Search
  if (search.trim()) {
    where.OR = [
      {
        player: {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
      {
        player: {
          phone: {
            contains: search,
          },
        },
      },
      {
        slot: {
          turf: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      },
    ];
  }

  const [bookings, total] = await prisma.$transaction([
    prisma.booking.findMany({
      where,

      skip,

      take: Number(limit),

      orderBy: {
        createdAt: "desc",
      },

      include: {
        player: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },

        slot: {
          include: {
            turf: {
              select: {
                id: true,
                name: true,
                location: true,
                sport: true,
                pricePerHour: true,
              },
            },
          },
        },
      },
    }),

    prisma.booking.count({
      where,
    }),
  ]);

  return {
    bookings,

    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  };
};

module.exports = {
  createBooking,
  getMyBookings,
  cancelBooking,
  getOwnerBookings,
};
