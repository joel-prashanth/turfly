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

  if (isNaN(start.getTime()) || isNaN(end.getTime()))
    if (end <= start) {
      throw new Error("endTime must be after startTime");
    }

  // overlap validation comes next

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

  const newSlot = await prisma.slot.create({
    data: {
      turfId,
      startTime: start,
      endTime: end,
    },
  });
  return newSlot;
};

module.exports = {
  createSlot,
};
