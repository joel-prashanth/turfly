const express = require("express");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");
const { createTurf, getMyTurfs, getAllTurfs } = require("./turf.controller");

const router = express.Router();

router.get("/", getAllTurfs);
router.get("/my", authenticate, authorize("OWNER"), getMyTurfs);
router.post("/", authenticate, authorize("OWNER"), createTurf);

module.exports = router;
