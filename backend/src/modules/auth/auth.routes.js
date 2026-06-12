const express = require("express");
const {
  registerController,
  loginController,
  logoutController,
} = require("./auth.controller");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");

const router = express.Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.post("/logout", logoutController);
router.get("/me", authenticate, (req, res) => {
  res.json({
    user: req.user,
  });
});
router.get("/owner-only", authenticate, authorize("OWNER"), (req, res) => {
  res.json({
    success: true,
    message: "Welcome, owner!",
  });
});
router.post("/logout", logoutController);

module.exports = router;
