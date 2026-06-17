const prisma = require("../../config/prisma");
const {
  releaseExpiredBookings,
} = require("../bookings/bookingLifecycle.service");

const getOwnedSlot = async (slotId, ownerId) => {
  const slot = await prisma.slot.findUnique({
    where: {
      id: slotId,
    },

    include: {
      turf: {
        select: {
          id: true,
          ownerId: true,
        },
      },
    },
  });

  if (!slot) {
    throw new Error("Slot not found");
  }

  if (slot.turf.ownerId !== ownerId) {
    throw new Error("You are not authorized to access this slot");
  }

  return slot;
};

const calculateSlotAmount = (startTime, endTime, pricePerHour) => {
  const start = new Date(startTime);
  const end = new Date(endTime);

  const durationMs = end.getTime() - start.getTime();
  const durationHours = durationMs / (1000 * 60 * 60);

  return Math.round(durationHours * pricePerHour);
};

const formatConfirmedBooking = (slot, pricePerHour) => {
  if (!slot.booking || slot.booking.status !== "CONFIRMED") {
    return null;
  }

  return {
    id: slot.booking.id,
    status: slot.booking.status,
    createdAt: slot.booking.createdAt,
    amount: calculateSlotAmount(slot.startTime, slot.endTime, pricePerHour),

    player: slot.booking.player
      ? {
          id: slot.booking.player.id,
          name: slot.booking.player.name,
          email: slot.booking.player.email,
          phone: slot.booking.player.phone,
        }
      : null,
  };
};

const createSlot = async (slotData, ownerId) => {
  const { turfId, startTime, endTime } = slotData;

  if (!turfId || !startTime || !endTime) {
    throw new Error("Turf id, start time and end time are required");
  }

  const turf = await prisma.turf.findUnique({
    where: {
      id: turfId,
    },
  });

  if (!turf) {
    throw new Error("Turf not found");
  }

  if (turf.ownerId !== ownerId) {
    throw new Error("You are not the owner of this turf");
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error("Invalid start time or end time");
  }

  if (end <= start) {
    throw new Error("End time must be after start time");
  }

  const overlappingSlot = await prisma.slot.findFirst({
    where: {
      turfId,

      startTime: {
        lt: end,
      },

      endTime: {
        gt: start,
      },
    },
  });

  if (overlappingSlot) {
    throw new Error("Slot overlaps with an existing slot");
  }

  return prisma.slot.create({
    data: {
      turfId,
      startTime: start,
      endTime: end,
    },
  });
};

const getSlotsByTurfId = async (turfId) => {
  await releaseExpiredBookings();

  const turf = await prisma.turf.findUnique({
    where: {
      id: turfId,
    },

    select: {
      id: true,
      name: true,
      location: true,
      sport: true,
      pricePerHour: true,

      slots: {
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
              status: true,
              createdAt: true,

              player: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!turf) {
    throw new Error("Turf not found");
  }

  return {
    turf: {
      id: turf.id,
      name: turf.name,
      location: turf.location,
      sport: turf.sport,
      pricePerHour: turf.pricePerHour,
    },

    slots: turf.slots.map((slot) => ({
      id: slot.id,
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: slot.status,

      booking: formatConfirmedBooking(slot, turf.pricePerHour),
    })),
  };
};

const getOwnerCalendar = async (ownerId, date) => {
  await releaseExpiredBookings();

  const selectedDate = date ? new Date(date) : new Date();

  if (isNaN(selectedDate.getTime())) {
    throw new Error("Invalid date");
  }

  const startOfDay = new Date(selectedDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(selectedDate);
  endOfDay.setHours(23, 59, 59, 999);

  const schedule = await prisma.turf.findMany({
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
      location: true,
      sport: true,
      pricePerHour: true,

      slots: {
        where: {
          startTime: {
            gte: startOfDay,
            lte: endOfDay,
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
              status: true,
              createdAt: true,

              player: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return schedule.map((turf) => ({
    id: turf.id,
    name: turf.name,
    location: turf.location,
    sport: turf.sport,
    pricePerHour: turf.pricePerHour,

    slots: turf.slots.map((slot) => ({
      id: slot.id,
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: slot.status,

      booking: formatConfirmedBooking(slot, turf.pricePerHour),
    })),
  }));
};

const editSlot = async (slotId, slotData, ownerId) => {
  const slot = await getOwnedSlot(slotId, ownerId);

  if (slot.status !== "AVAILABLE") {
    throw new Error("Only available slots can be edited");
  }

  const { startTime, endTime } = slotData;

  if (!startTime || !endTime) {
    throw new Error("Start time and end time are required");
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error("Invalid start time or end time");
  }

  if (end <= start) {
    throw new Error("End time must be after start time");
  }

  const overlappingSlot = await prisma.slot.findFirst({
    where: {
      turfId: slot.turfId,

      id: {
        not: slot.id,
      },

      startTime: {
        lt: end,
      },

      endTime: {
        gt: start,
      },
    },
  });

  if (overlappingSlot) {
    throw new Error("Slot overlaps with an existing slot");
  }

  return prisma.slot.update({
    where: {
      id: slot.id,
    },

    data: {
      startTime: start,
      endTime: end,
    },
  });
};

const blockSlot = async (slotId, ownerId) => {
  const slot = await getOwnedSlot(slotId, ownerId);

  if (slot.status !== "AVAILABLE") {
    throw new Error("Only available slots can be blocked");
  }

  return prisma.slot.update({
    where: {
      id: slot.id,
    },

    data: {
      status: "BLOCKED",
    },
  });
};

const unblockSlot = async (slotId, ownerId) => {
  const slot = await getOwnedSlot(slotId, ownerId);

  if (slot.status !== "BLOCKED") {
    throw new Error("Only blocked slots can be unblocked");
  }

  return prisma.slot.update({
    where: {
      id: slot.id,
    },

    data: {
      status: "AVAILABLE",
    },
  });
};

const deleteSlot = async (slotId, ownerId) => {
  const slot = await getOwnedSlot(slotId, ownerId);

  if (slot.status !== "AVAILABLE") {
    throw new Error("Only available slots can be deleted");
  }

  await prisma.$transaction([
    prisma.booking.deleteMany({
      where: {
        slotId: slot.id,
      },
    }),

    prisma.slot.delete({
      where: {
        id: slot.id,
      },
    }),
  ]);

  return;
};

module.exports = {
  createSlot,
  getSlotsByTurfId,
  getOwnerCalendar,
  editSlot,
  blockSlot,
  unblockSlot,
  deleteSlot,
};
