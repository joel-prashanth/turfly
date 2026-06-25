const express = require("express");

const {
  registerController,
  loginController,
  logoutController,
  getCurrentUser,
  updateProfileController,
  changePasswordController,
  updateSettingsController,
} = require("./auth.controller");

const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");

const router = express.Router();

router.post("/register", registerController);

router.post("/login", loginController);

router.post("/logout", logoutController);

router.get("/me", authenticate, getCurrentUser);

router.patch("/profile", authenticate, updateProfileController);

router.patch("/password", authenticate, changePasswordController);

router.patch("/settings", authenticate, updateSettingsController);

router.get("/owner-only", authenticate, authorize("OWNER"), (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome, owner!",
  });
});

module.exports = router;
