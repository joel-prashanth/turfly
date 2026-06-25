const slotService = require("./slot.service");

const createSlot = async (req, res) => {
  try {
    const { turfId, startTime, endTime } = req.body;

    const slot = await slotService.createSlot(
      {
        turfId,
        startTime,
        endTime,
      },
      req.user.id,
    );

    return res.status(201).json({
      success: true,
      message: "Slot created successfully",
      slot,
    });
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getSlotsByTurfId = async (req, res) => {
  try {
    const { turfId } = req.params;
    const playerId = req.user?.id ?? null;

    const { turf, slots } = await slotService.getSlotsByTurfId(turfId, playerId);

    return res.status(200).json({
      success: true,
      turf,
      slots,
    });
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getOwnerCalendar = async (req, res) => {
  try {
    const schedule = await slotService.getOwnerCalendar(
      req.user.id,
      req.query.date,
    );

    return res.status(200).json({
      success: true,
      data: {
        schedule,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const editSlot = async (req, res) => {
  try {
    const slot = await slotService.editSlot(
      req.params.slotId,
      req.body,
      req.user.id,
    );

    return res.status(200).json({
      success: true,
      message: "Slot updated successfully",
      slot,
    });
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const blockSlot = async (req, res) => {
  try {
    const slot = await slotService.blockSlot(req.params.slotId, req.user.id);

    return res.status(200).json({
      success: true,
      message: "Slot blocked successfully",
      slot,
    });
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const unblockSlot = async (req, res) => {
  try {
    const slot = await slotService.unblockSlot(req.params.slotId, req.user.id);

    return res.status(200).json({
      success: true,
      message: "Slot unblocked successfully",
      slot,
    });
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteSlot = async (req, res) => {
  try {
    await slotService.deleteSlot(req.params.slotId, req.user.id);

    return res.status(200).json({
      success: true,
      message: "Slot deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const bulkGenerateSlots = async (req, res) => {
  try {
    const result = await slotService.bulkGenerateSlots(req.body, req.user.id);
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ success: false, message: error.message });
  }
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
