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

router.get(
  "/owner",
  authenticate,
  authorize("OWNER"),
  bookingController.getOwnerBookings,
);

router.patch(
  "/:id/cancel",
  authenticate,
  authorize("PLAYER"),
  bookingController.cancelBooking,
);

module.exports = router;
