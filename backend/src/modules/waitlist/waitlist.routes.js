const router = require("express").Router();
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");
const ctrl = require("./waitlist.controller");

router.get("/my", authenticate, authorize("PLAYER"), ctrl.getMyWaitlist);
router.post("/:slotId", authenticate, authorize("PLAYER"), ctrl.join);
router.delete("/:slotId", authenticate, authorize("PLAYER"), ctrl.leave);

module.exports = router;
