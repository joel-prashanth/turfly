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

router.patch(
  "/:id/owner-cancel",
  authenticate,
  authorize("OWNER"),
  bookingController.ownerCancelBooking,
);

router.post(
  "/manual",
  authenticate,
  authorize("OWNER"),
  bookingController.createManualBooking,
);

router.get(
  "/:id/extend-options",
  authenticate,
  authorize("PLAYER"),
  bookingController.getExtendOptions,
);

router.patch(
  "/:id/reschedule",
  authenticate,
  authorize("PLAYER"),
  bookingController.rescheduleBooking,
);

router.patch(
  "/:id/attendance",
  authenticate,
  authorize("OWNER"),
  bookingController.markAttendance,
);

module.exports = router;
