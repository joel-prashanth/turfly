const router = require("express").Router();
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");
const ctrl = require("./admin.controller");

// Public — no admin exists yet when this is first used
router.post("/setup", ctrl.setupAdmin);

// All routes below require ADMIN auth
router.use(authenticate, authorize("ADMIN"));

router.get("/stats", ctrl.getPlatformStats);
router.get("/owners", ctrl.listOwners);
router.get("/owners/:id", ctrl.getOwnerDetail);
router.patch("/owners/:id/approve", ctrl.approveOwner);
router.patch("/owners/:id/reject", ctrl.rejectOwner);
router.patch("/owners/:id/suspend", ctrl.suspendOwner);
router.patch("/owners/:id/reactivate", ctrl.reactivateOwner);

module.exports = router;
