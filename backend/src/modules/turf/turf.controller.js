const turfService = require("./turf.service");

const createTurf = async (req, res) => {
  try {
    const {
      name,
      description,
      location,
      pricePerHour,
      sport,
      imageUrl,
      imagePublicId,
    } = req.body;

    const ownerId = req.user.userId;

    const turf = await turfService.createTurf({
      name,
      description,
      location,
      pricePerHour,
      sport,
      imageUrl,
      imagePublicId,
      ownerId,
    });

    return res.status(201).json({
      success: true,
      message: "Turf created successfully.",
      turf,
    });
  } catch (error) {
    console.error(error);

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
    console.error(error);

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
    console.error(error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getTurfById = async (req, res) => {
  try {
    const { id } = req.params;

    const turf = await turfService.getTurfById(id);

    return res.status(200).json({
      success: true,
      turf,
    });
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateTurfController = async (req, res) => {
  try {
    const { id } = req.params;

    const ownerId = req.user.userId;

    const updatedTurf = await turfService.updateTurf(id, ownerId, req.body);

    return res.status(200).json({
      success: true,
      message: "Turf updated successfully.",
      turf: updatedTurf,
    });
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteTurfController = async (req, res) => {
  try {
    const { id } = req.params;

    const ownerId = req.user.userId;

    const result = await turfService.deleteTurf(id, ownerId);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error(error);

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
  getTurfById,
  updateTurfController,
  deleteTurfController,
};
