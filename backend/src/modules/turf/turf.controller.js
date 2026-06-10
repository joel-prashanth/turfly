const createTurfService = require("./turf.service");

const createTurfController = async (req, res) => {
  try {
    const { name, description, location, pricePerHour } = req.body;

    const ownerId = req.user.userId;

    const turfData = {
      name,
      description,
      location,
      pricePerHour,
      ownerId,
    };

    const turf = await createTurfService.createTurf(turfData);

    return res.status(201).json({
      success: true,
      message: "Turf Created successfully",
      turf,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createTurfController,
};
