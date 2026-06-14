const prisma = require("../../config/prisma");

const getStartOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const getEndOfToday = () => {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date;
};

const getActiveTurfs = (ownerId) => {
  return prisma.turf.count({
    where: {
      ownerId,
      isActive: true,
    },
  });
};

const getTodayBookings = (ownerId) => {
  return prisma.booking.count({
    where: {
      slot: {
        turf: {
          ownerId,
        },
        startTime: {
          gte: getStartOfToday(),
          lte: getEndOfToday(),
        },
      },
    },
  });
};

const getUpcomingSlots = (ownerId) => {
  return prisma.slot.count({
    where: {
      turf: {
        ownerId,
      },
      status: "AVAILABLE",
      startTime: {
        gt: new Date(),
      },
    },
  });
};

const getUniquePlayers = async (ownerId) => {
  const bookings = await prisma.booking.findMany({
    where: {
      slot: {
        turf: {
          ownerId,
        },
      },
    },
    select: {
      playerId: true,
    },
  });

  return new Set(bookings.map((booking) => booking.playerId)).size;
};

const getRevenue = async (ownerId) => {
  const bookings = await prisma.booking.findMany({
    where: {
      status: "CONFIRMED",
      slot: {
        turf: {
          ownerId,
        },
      },
    },
    select: {
      slot: {
        select: {
          startTime: true,
          endTime: true,
          turf: {
            select: {
              pricePerHour: true,
            },
          },
        },
      },
    },
  });

  return bookings.reduce((total, booking) => {
    const start = booking.slot.startTime.getTime();
    const end = booking.slot.endTime.getTime();

    const durationInHours = (end - start) / (1000 * 60 * 60);

    if (durationInHours <= 0) {
      console.warn(
        `Skipping invalid slot. Start: ${booking.slot.startTime.toISOString()}, End: ${booking.slot.endTime.toISOString()}`,
      );

      return total;
    }

    return total + durationInHours * booking.slot.turf.pricePerHour;
  }, 0);
};

const getOwnerDashboardStats = async (ownerId) => {
  const [activeTurfs, todayBookings, upcomingSlots, players, revenue] =
    await Promise.all([
      getActiveTurfs(ownerId),
      getTodayBookings(ownerId),
      getUpcomingSlots(ownerId),
      getUniquePlayers(ownerId),
      getRevenue(ownerId),
    ]);

  return {
    activeTurfs,
    todayBookings,
    upcomingSlots,
    players,
    revenue,
  };
};

const getOwnerRecentBookings = async (ownerId) => {
  return prisma.booking.findMany({
    where: {
      slot: {
        turf: {
          ownerId,
        },
      },
    },

    take: 5,

    orderBy: {
      createdAt: "desc",
    },

    include: {
      player: {
        select: {
          id: true,
          name: true,
        },
      },

      slot: {
        select: {
          startTime: true,
          endTime: true,

          turf: {
            select: {
              id: true,
              name: true,
              sport: true,
            },
          },
        },
      },
    },
  });
};

/**
 * Returns today's slots grouped by turf.
 * This powers the Owner Dashboard timeline.
 */
const getOwnerTodaySchedule = async (ownerId) => {
  const turfs = await prisma.turf.findMany({
    where: {
      ownerId,
      isActive: true,
    },

    orderBy: {
      name: "asc",
    },

    select: {
      id: true,
      name: true,
      sport: true,

      slots: {
        where: {
          startTime: {
            gte: getStartOfToday(),
            lte: getEndOfToday(),
          },
        },

        orderBy: {
          startTime: "asc",
        },

        select: {
          id: true,
          startTime: true,
          endTime: true,
          status: true,

          booking: {
            select: {
              id: true,

              player: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return turfs;
};

module.exports = {
  getOwnerDashboardStats,
  getOwnerRecentBookings,
  getOwnerTodaySchedule,
};
