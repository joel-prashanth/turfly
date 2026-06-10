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

module.exports = {
  createTurf,
};
