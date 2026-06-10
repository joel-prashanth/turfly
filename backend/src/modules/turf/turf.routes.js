const express = require("express");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");
const {
  createTurf,
  getMyTurfs,
  getAllTurfs,
  getTurfById,
} = require("./turf.controller");

const router = express.Router();

router.get("/", getAllTurfs);

router.get("/my", authenticate, authorize("OWNER"), getMyTurfs);

router.get("/:id", getTurfById);

router.post("/", authenticate, authorize("OWNER"), createTurf);

module.exports = router;
