const prisma = require("../../config/prisma");
const {
  releaseExpiredBookings,
} = require("../bookings/bookingLifecycle.service");
const {
  releaseExpiredPendingBookings,
} = require("../bookings/booking.service");

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

  return Math.round(durationHours * Number(pricePerHour || 0));
};

const getPublicSlotStatus = (slot) => {
  const now = new Date();
  const start = new Date(slot.startTime);
  const end = new Date(slot.endTime);

  if (slot.status === "AVAILABLE" && now >= end) {
    return "EXPIRED";
  }

  if (slot.status === "AVAILABLE" && now >= start && now < end) {
    return "LIVE";
  }

  return slot.status;
};

const formatSlotBooking = (slot, pricePerHour, options = {}) => {
  const { includePending = false } = options;

  const booking = slot.bookings?.find((item) => {
    if (item.status === "CONFIRMED") return true;
    if (item.status === "COMPLETED") return true;
    if (includePending && item.status === "PENDING") return true;
    return false;
  });

  if (!booking) {
    return null;
  }

  return {
    id: booking.id,
    status: booking.status,
    createdAt: booking.createdAt,
    amount:
      booking.amount ||
      calculateSlotAmount(slot.startTime, slot.endTime, pricePerHour),

    payment: booking.payment
      ? {
          id: booking.payment.id,
          status: booking.payment.status,
          provider: booking.payment.provider,
          amount: booking.payment.amount,
          currency: booking.payment.currency,
          razorpayOrderId: booking.payment.razorpayOrderId,
        }
      : null,

    player: booking.player
      ? { id: booking.player.id, name: booking.player.name, email: booking.player.email, phone: booking.player.phone }
      : booking.walkInName
      ? { id: null, name: booking.walkInName, phone: booking.walkInPhone, email: null }
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

const getSlotsByTurfId = async (turfId, playerId = null) => {
  await releaseExpiredBookings();
  await releaseExpiredPendingBookings();

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

          bookings: {
            where: {
              status: {
                in: ["PENDING", "CONFIRMED", "COMPLETED"],
              },
            },
            orderBy: {
              createdAt: "desc",
            },
            select: {
              id: true,
              status: true,
              amount: true,
              createdAt: true,
              playerId: true,
              walkInName: true,
              walkInPhone: true,

              payment: {
                select: {
                  id: true,
                  status: true,
                  provider: true,
                  amount: true,
                  currency: true,
                  razorpayOrderId: true,
                },
              },

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
      status: getPublicSlotStatus(slot),
      actualStatus: slot.status,
      isBookedByMe: playerId
        ? slot.bookings.some(
            (b) =>
              b.playerId === playerId &&
              (b.status === "CONFIRMED" || b.status === "PENDING"),
          )
        : false,

      booking: formatSlotBooking(slot, turf.pricePerHour, {
        includePending: false,
      }),
    })),
  };
};

const getOwnerCalendar = async (ownerId, date) => {
  await releaseExpiredBookings();
  await releaseExpiredPendingBookings();

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

          bookings: {
            where: {
              status: {
                in: ["PENDING", "CONFIRMED"],
              },
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
            select: {
              id: true,
              status: true,
              amount: true,
              createdAt: true,

              payment: {
                select: {
                  id: true,
                  status: true,
                  provider: true,
                  amount: true,
                  currency: true,
                  razorpayOrderId: true,
                },
              },

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

      // Owner calendar can see pending reservations too.
      booking: formatSlotBooking(slot, turf.pricePerHour, {
        includePending: true,
      }),
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

  const now = new Date();
  const isPast = new Date(slot.endTime) <= now;

  if (!isPast && slot.status !== "AVAILABLE") {
    throw new Error(
      "Only available slots can be deleted. Cancel any bookings first.",
    );
  }

  await prisma.$transaction([
    prisma.payment.deleteMany({
      where: {
        booking: {
          slotId: slot.id,
        },
      },
    }),

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

const bulkGenerateSlots = async (
  { turfId, days, startDate, endDate, openTime, closeTime, durationMinutes },
  ownerId,
) => {
  const turf = await prisma.turf.findUnique({ where: { id: turfId } });
  if (!turf) throw new Error("Turf not found");
  if (turf.ownerId !== ownerId) throw new Error("Not authorized");

  const dur = Number(durationMinutes);
  if (!dur || dur < 30) throw new Error("Duration must be at least 30 minutes");

  const rangeStart = new Date(startDate);
  const rangeEnd = new Date(endDate);
  rangeStart.setHours(0, 0, 0, 0);
  rangeEnd.setHours(23, 59, 59, 999);

  if (isNaN(rangeStart) || isNaN(rangeEnd))
    throw new Error("Invalid date range");
  if (rangeEnd < rangeStart)
    throw new Error("End date must be on or after start date");

  const diffDays = Math.ceil(
    (rangeEnd - rangeStart) / (1000 * 60 * 60 * 24),
  );
  if (diffDays > 32) throw new Error("Date range cannot exceed 30 days per generation. Run again for more.");

  if (!Array.isArray(days) || days.length === 0)
    throw new Error("Select at least one day");

  const [openH, openM] = openTime.split(":").map(Number);
  const [closeH, closeM] = closeTime.split(":").map(Number);
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;
  if (closeMinutes <= openMinutes)
    throw new Error("Close time must be after open time");
  if (closeMinutes - openMinutes < dur)
    throw new Error("Operating window is shorter than one slot duration");

  // Fetch existing slots in range for overlap checking
  const existing = await prisma.slot.findMany({
    where: {
      turfId,
      startTime: { lt: rangeEnd },
      endTime: { gt: rangeStart },
    },
    select: { startTime: true, endTime: true },
  });

  // Generate candidates
  const candidates = [];
  const cursor = new Date(rangeStart);

  while (cursor <= rangeEnd) {
    if (days.includes(cursor.getDay())) {
      let slotStart = new Date(cursor);
      slotStart.setHours(openH, openM, 0, 0);

      while (true) {
        const slotEnd = new Date(slotStart.getTime() + dur * 60 * 1000);
        const endMins = slotEnd.getHours() * 60 + slotEnd.getMinutes();
        if (endMins > closeMinutes) break;

        candidates.push({
          turfId,
          startTime: new Date(slotStart),
          endTime: new Date(slotEnd),
        });
        slotStart = slotEnd;
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  // Remove candidates that overlap any existing slot
  const toCreate = candidates.filter(
    (c) =>
      !existing.some(
        (e) => c.startTime < e.endTime && c.endTime > e.startTime,
      ),
  );

  // Batch inserts to avoid memory pressure on large ranges
  const BATCH = 100;
  let created = 0;
  for (let i = 0; i < toCreate.length; i += BATCH) {
    const batch = toCreate.slice(i, i + BATCH);
    const result = await prisma.slot.createMany({ data: batch });
    created += result.count;
  }

  return {
    created,
    skipped: candidates.length - created,
    total: candidates.length,
  };
};

module.exports = {
  createSlot,
  getSlotsByTurfId,
  getOwnerCalendar,
  editSlot,
  blockSlot,
  unblockSlot,
  deleteSlot,
  bulkGenerateSlots,
};
