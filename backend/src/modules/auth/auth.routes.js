const express = require("express");

const {
  registerController,
  loginController,
  logoutController,
  getCurrentUser,
} = require("./auth.controller");

const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");

const router = express.Router();

router.post("/register", registerController);

router.post("/login", loginController);

router.post("/logout", logoutController);

router.get("/me", authenticate, getCurrentUser);

router.get("/owner-only", authenticate, authorize("OWNER"), (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome, owner!",
  });
});

module.exports = router;
