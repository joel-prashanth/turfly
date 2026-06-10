const express = require("express");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");
const { createTurfController } = require("./turf.controller");

const router = express.Router();

router.post("/", authenticate, authorize("OWNER"), createTurfController);

module.exports = router;
