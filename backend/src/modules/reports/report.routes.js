const router = require("express").Router();
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");
const ctrl = require("./report.controller");

// Player — report a turf
router.post("/turfs/:turfId", authenticate, authorize("PLAYER"), ctrl.submitReport);

// Admin — list + dismiss
router.get("/", authenticate, authorize("ADMIN"), ctrl.listReports);
router.patch("/:id/dismiss", authenticate, authorize("ADMIN"), ctrl.dismissReport);

module.exports = router;
