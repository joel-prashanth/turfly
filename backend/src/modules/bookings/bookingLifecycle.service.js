const prisma = require("../../config/prisma");

const releaseExpiredBookings = async () => {
  const now = new Date();

  console.log("\n========== BOOKING LIFECYCLE ==========");
  console.log("Current time:", now.toISOString());

  const expiredConfirmed = await prisma.booking.findMany({
    where: {
      status: "CONFIRMED",
      slot: { endTime: { lt: now } },
    },
    select: { id: true, slotId: true },
  });

  // PENDING bookings whose slot time has passed are cancelled — the slot
  // time window is gone so they can never be fulfilled.
  const expiredPending = await prisma.booking.findMany({
    where: {
      status: "PENDING",
      slot: { endTime: { lt: now } },
    },
    select: { id: true, slotId: true },
  });

  console.log("Expired confirmed:", expiredConfirmed.length);
  console.log("Expired pending:", expiredPending.length);

  if (expiredConfirmed.length === 0 && expiredPending.length === 0) {
    console.log("Nothing to update.");
    console.log("=====================================\n");
    return;
  }

  await prisma.$transaction([
    ...expiredConfirmed.map((b) =>
      prisma.booking.update({ where: { id: b.id }, data: { status: "COMPLETED" } }),
    ),
    ...expiredPending.map((b) =>
      prisma.booking.update({ where: { id: b.id }, data: { status: "CANCELLED" } }),
    ),
  ]);

  console.log("Completed lifecycle update.");
  console.log("=====================================\n");
};

module.exports = {
  releaseExpiredBookings,
};
