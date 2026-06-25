const router = require("express").Router();
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");
const { createOrder, verifyPayment, markAttendanceCtrl } = require("./deposit.controller");

// Player — create & verify deposit
router.post("/order", authenticate, authorize("PLAYER"), createOrder);
router.post("/verify", authenticate, authorize("PLAYER"), verifyPayment);

// Owner — mark attendance after slot ends
router.post("/:bookingId/attendance", authenticate, authorize("OWNER"), markAttendanceCtrl);

module.exports = router;
