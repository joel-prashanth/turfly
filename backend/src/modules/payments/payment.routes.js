const router = require("express").Router();

const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");

const {
  createRazorpayOrder,
  verifyRazorpayPayment,
} = require("./payment.controller");

router.post("/order", authenticate, authorize("PLAYER"), createRazorpayOrder);

router.post(
  "/verify",
  authenticate,
  authorize("PLAYER"),
  verifyRazorpayPayment,
);

module.exports = router;
