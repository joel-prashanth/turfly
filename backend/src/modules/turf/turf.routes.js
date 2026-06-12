const express = require("express");

const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");

const {
  createTurf,
  getMyTurfs,
  getAllTurfs,
  getTurfById,
  deleteTurfController,
} = require("./turf.controller");

const router = express.Router();

// Public Routes
router.get("/", getAllTurfs);

// Owner Routes
router.get(
  "/my",
  authenticate,
  authorize("OWNER"),
  getMyTurfs
);

router.post(
  "/",
  authenticate,
  authorize("OWNER"),
  createTurf
);

router.delete(
  "/:id",
  authenticate,
  authorize("OWNER"),
  deleteTurfController
);

// Keep this LAST among GET routes with parameters
router.get("/:id", getTurfById);

module.exports = router;