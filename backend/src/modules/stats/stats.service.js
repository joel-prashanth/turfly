const prisma = require("../../config/prisma");

const getPlatformStats = async () => {
  const [turfs, owners, players, bookings] = await Promise.all([
    prisma.turf.count({
      where: {
        isActive: true,
      },
    }),

    prisma.user.count({
      where: {
        role: "OWNER",
      },
    }),

    prisma.user.count({
      where: {
        role: "PLAYER",
      },
    }),

    prisma.booking.count(),
  ]);

  return {
    turfs,
    owners,
    players,
    bookings,
  };
};

module.exports = {
  getPlatformStats,
};
