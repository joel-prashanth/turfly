const express = require("express");

const statsController = require("./stats.controller");

const router = express.Router();

router.get("/", statsController.getPlatformStats);

module.exports = router;
