const slotService = require("./slot.service");

const createSlot = async (req, res) => {
  try {
    const { turfId, startTime, endTime } = req.body;

    const ownerId = req.user.userId;

    const slotData = {
      turfId,
      startTime,
      endTime,
    };

    const slot = await slotService.createSlot(slotData, ownerId);

    return res.status(201).json({
      success: true,
      message: "Slot created successfully",
      slot,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createSlot,
};
