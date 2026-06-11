const bookingService = require("./booking.service");

const createBooking = async (req, res) => {
  try {
    const { slotId } = req.body;
    const { userId } = req.user;

    const booking = await bookingService.createBooking(
      slotId,
      userId
    );

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createBooking,
};