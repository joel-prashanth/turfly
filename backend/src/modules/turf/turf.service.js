const prisma = require("../../config/prisma");

const createTurf = async (turfData) => {
  const { name, description, location, pricePerHour, ownerId } = turfData;

  if (!name || !location || !pricePerHour) {
    throw new Error("Name, location and pricePerHour are required");
  }

  if (pricePerHour <= 0) {
    throw new Error("pricePerHour must be greater than 0");
  }

  const newTurf = await prisma.turf.create({
    data: {
      name,
      description,
      location,
      pricePerHour,
      ownerId,
    },
  });
  return newTurf;
};

const getMyTurfs = async (ownerId) => {
  const turfs = await prisma.turf.findMany({
    where: { ownerId },
    orderBy: { createdAt: "desc" },
  });
  return turfs;
};

const getAllTurfs = async () => {
  const turfs = await prisma.turf.findMany({
    orderBy: { createdAt: "desc" },
  });
  return turfs;
};

const getTurfById = async (turfId) => {
   if (!turfId) {
    throw new Error("Turf id is required");
  }


  const id = Number(turfId);
  const turf = await prisma.turf.findUnique({
    where: { id: turfId },
  });

  if (!turf) {
    throw new Error("Turf not found");
  }

  return turf;
};

module.exports = {
  createTurf,
  getMyTurfs,
  getAllTurfs,
  getTurfById,
};
