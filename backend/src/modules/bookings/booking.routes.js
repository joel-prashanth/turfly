const express = require("express");

const bookingController = require("./booking.controller");

const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorize("PLAYER"),
  bookingController.createBooking,
);
router.get(
  "/my",
  authenticate,
  authorize("PLAYER"),
  bookingController.getMyBookings,
);

module.exports = router;
