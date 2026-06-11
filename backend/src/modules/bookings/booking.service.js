const prisma = require("../../config/prisma");

const createBooking = async (slotId, playerId) => {
  const slot = await prisma.slot.findUnique({
    where: {
      id: slotId,
    },
  });

  if (!slot) {
    throw new Error("Slot not found");
  }

  if (slot.status === "BOOKED") {
    throw new Error("Slot already booked");
  }

  const booking = await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.create({
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

    return booking;
  });

  return booking;
};

module.exports = {
  createBooking,
};
