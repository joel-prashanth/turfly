const prisma = require("../config/prisma");

const releaseExpiredBookings = async () => {
  const now = new Date();

  const expiredBookings = await prisma.booking.findMany({
    where: {
      status: "CONFIRMED",
      slot: {
        endTime: {
          lt: now,
        },
      },
    },
    select: {
      slotId: true,
    },
  });

  if (!expiredBookings.length) {
    return;
  }

  await prisma.$transaction(
    expiredBookings.map((booking) =>
      prisma.slot.update({
        where: {
          id: booking.slotId,
        },
        data: {
          status: "AVAILABLE",
        },
      }),
    ),
  );
};

module.exports = {
  releaseExpiredBookings,
};