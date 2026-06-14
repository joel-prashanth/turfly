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

module.exports = router;