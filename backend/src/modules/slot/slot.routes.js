const router = require("express").Router();
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");
const { createSlot, getSlotsByTurfId } = require("./slot.controller");


router.post("/", authenticate, authorize("OWNER"), createSlot);

module.exports = router;
