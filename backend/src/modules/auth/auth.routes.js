const express = require("express");
const { registerController, loginController } = require("./auth.controller");
const  authenticate  = require("../../middleware/authenticate");

const router = express.Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.get("/me", authenticate, (req, res) => {
  res.json({
    user: req.user,
  });
});

module.exports = router;
