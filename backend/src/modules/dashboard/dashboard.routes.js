const express = require("express");

const dashboardController = require("./dashboard.controller");

const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");

const router = express.Router();

router.get(
  "/owner",
  authenticate,
  authorize("OWNER"),
  dashboardController.getOwnerDashboardStats,
);

router.get(
  "/owner/recent-bookings",
  authenticate,
  authorize("OWNER"),
  dashboardController.getOwnerRecentBookings,
);

router.get(
  "/owner/analytics/revenue",
  authenticate,
  authorize("OWNER"),
  dashboardController.getRevenueAnalytics,
);

router.get(
  "/owner/today-schedule",
  authenticate,
  authorize("OWNER"),
  dashboardController.getOwnerTodaySchedule,
);

module.exports = router;
