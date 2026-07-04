const bookingService = require("./booking.service");

const createBooking = async (req, res) => {
  try {
    const { slotId, slotIds } = req.body;
    const { userId } = req.user;

    // Accept slotIds[] (multi-slot) or legacy slotId (single)
    const ids = slotIds || slotId;
    const booking = await bookingService.createBooking(ids, userId);

    return res.status(201).json({
      success: true,
      message: "Booking initiated successfully",
      booking,
    });
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const { userId } = req.user;

    const bookings = await bookingService.getMyBookings(userId);

    return res.status(200).json({
      success: true,
      message: "Bookings retrieved successfully",
      bookings,
    });
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getOwnerBookings = async (req, res) => {
  try {
    const { userId } = req.user;

    const result = await bookingService.getOwnerBookings(userId, req.query);

    return res.status(200).json({
      success: true,
      message: "Owner bookings retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    const result = await bookingService.cancelBooking(id, userId);

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

const ownerCancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    const result = await bookingService.ownerCancelBooking(id, userId);

    return res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getExtendOptions = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    const data = await bookingService.getExtendOptions(id, userId);
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const rescheduleBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { newSlotId } = req.body;
    const { userId } = req.user;
    const result = await bookingService.rescheduleBooking(id, newSlotId, userId);
    return res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

const createManualBooking = async (req, res) => {
  try {
    const { turfId, walkInName, walkInPhone, startTime, endTime } = req.body;
    const { userId } = req.user;
    const result = await bookingService.createManualBooking(userId, { turfId, walkInName, walkInPhone, startTime, endTime });
    return res.status(201).json({ success: true, message: result.message });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const markAttendance = async (req, res) => {
  try {
    const result = await bookingService.markAttendance(
      req.params.id,
      req.user.userId,
      req.body.status,
    );
    return res.json({ success: true, message: result.message });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createBooking,
  createManualBooking,
  getMyBookings,
  getOwnerBookings,
  cancelBooking,
  ownerCancelBooking,
  getExtendOptions,
  rescheduleBooking,
  markAttendance,
};