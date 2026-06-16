const router = require("express").Router();

const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");

const {
  createSlot,
  getSlotsByTurfId,
  getOwnerCalendar,
  editSlot,
  blockSlot,
  deleteSlot,
  unblockSlot,
} = require("./slot.controller");

// Owner
router.post("/", authenticate, authorize("OWNER"), createSlot);

// Owner Calendar
router.get("/schedule", authenticate, authorize("OWNER"), getOwnerCalendar);

// Owner Slot Actions
router.patch("/:slotId", authenticate, authorize("OWNER"), editSlot);

router.patch("/:slotId/block", authenticate, authorize("OWNER"), blockSlot);

router.patch("/:slotId/unblock", authenticate, authorize("OWNER"), unblockSlot);

router.delete("/:slotId", authenticate, authorize("OWNER"), deleteSlot);

// Public (Players & Owners)
router.get("/turf/:turfId", getSlotsByTurfId);

module.exports = router;
