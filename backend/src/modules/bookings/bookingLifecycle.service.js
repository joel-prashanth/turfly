const prisma = require("../../config/prisma");

const releaseExpiredBookings = async () => {
  const now = new Date();

  console.log("\n========== BOOKING LIFECYCLE ==========");
  console.log("Current time:", now.toISOString());

  const expiredBookings = await prisma.booking.findMany({
    where: {
      status: "CONFIRMED",
      slot: {
        endTime: {
          lt: now,
        },
      },
    },
    include: {
      slot: true,
    },
  });

  console.log("Expired bookings found:", expiredBookings.length);

  expiredBookings.forEach((booking) => {
    console.log({
      bookingId: booking.id,
      slotId: booking.slotId,
      status: booking.status,
      endTime: booking.slot.endTime,
    });
  });

  if (expiredBookings.length === 0) {
    console.log("Nothing to update.");
    console.log("=====================================\n");
    return;
  }

  await prisma.$transaction([
    ...expiredBookings.map((booking) =>
      prisma.booking.update({
        where: {
          id: booking.id,
        },
        data: {
          status: "COMPLETED",
        },
      }),
    ),

    ...expiredBookings.map((booking) =>
      prisma.slot.update({
        where: {
          id: booking.slotId,
        },
        data: {
          status: "AVAILABLE",
        },
      }),
    ),
  ]);

  console.log("Completed lifecycle update.");
  console.log("=====================================\n");
};

module.exports = {
  releaseExpiredBookings,
};
