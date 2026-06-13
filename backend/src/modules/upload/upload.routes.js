const express = require("express");

const uploadController = require("./upload.controller");
const authenticate = require("../../middleware/authenticate");
const upload = require("../../middleware/upload");

const router = express.Router();

router.post(
  "/image",
  authenticate,
  upload.single("image"),
  uploadController.uploadImage
);

module.exports = router;