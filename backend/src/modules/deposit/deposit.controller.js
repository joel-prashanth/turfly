const { createDepositOrder, verifyDepositPayment, markAttendance } = require("./deposit.service");

const createOrder = async (req, res) => {
  try {
    const data = await createDepositOrder(req.body.bookingId, req.user.id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const data = await verifyDepositPayment({ ...req.body, playerId: req.user.id });
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const markAttendanceCtrl = async (req, res) => {
  try {
    const { attended } = req.body;
    if (typeof attended !== "boolean") {
      return res.status(400).json({ success: false, message: "'attended' must be true or false" });
    }
    const data = await markAttendance(req.params.bookingId, req.user.id, attended);
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = { createOrder, verifyPayment, markAttendanceCtrl };
