const slotService = require("./slot.service");

const createSlot = async (req, res) => {
  try {
    const { turfId, startTime, endTime } = req.body;

    const ownerId = req.user.id;

    const slot = await slotService.createSlot(
      {
        turfId,
        startTime,
        endTime,
      },
      ownerId,
    );

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

const getSlotsByTurfId = async (req, res) => {
  try {
    const { turfId } = req.params;

    const ownerId = req.user.id;

    const slots = await slotService.getSlotsByTurfId(turfId, ownerId);

    return res.status(200).json({
      success: true,
      slots,
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
  getSlotsByTurfId,
};
