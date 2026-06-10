const express = require("express");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");
const { createTurf, getMyTurfs } = require("./turf.controller");

const router = express.Router();

router.post("/", authenticate, authorize("OWNER"), createTurf);
router.get("/my", authenticate, authorize("OWNER"), getMyTurfs);

module.exports = router;
