const express = require("express");
const authenticate = require("../../middleware/authenticate");
const { getNotifications, markAllRead, markOneRead, clearAll } = require("./notification.controller");

const router = express.Router();

router.get("/",           authenticate, getNotifications);
router.patch("/read-all", authenticate, markAllRead);
router.patch("/:id/read", authenticate, markOneRead);
router.delete("/",        authenticate, clearAll);

module.exports = router;
