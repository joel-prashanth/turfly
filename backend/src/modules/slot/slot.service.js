const prisma = require("../../config/prisma");

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
  const turf = await prisma.turf.findUnique({
    where: {
      id: turfId,
    },
  });

  if (!turf) {
    throw new Error("Turf not found");
  }

  return prisma.slot.findMany({
    where: {
      turfId,
    },
    orderBy: {
      startTime: "asc",
    },
  });
};

module.exports = {
  createSlot,
  getSlotsByTurfId,
};