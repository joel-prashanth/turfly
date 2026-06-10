const turfService = require("./turf.service");

const createTurf = async (req, res) => {
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

    const turf = await turfService.createTurf(turfData);

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

const getMyTurfs = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const turfs = await turfService.getMyTurfs(ownerId);

    return res.status(200).json({
      success: true,
      count: turfs.length,
      turfs,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllTurfs = async (req, res) => {
  try {
    const turfs = await turfService.getAllTurfs();

    return res.status(200).json({
      success: true,
      count: turfs.length,
      turfs,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createTurf,
  getMyTurfs,
  getAllTurfs,
};
