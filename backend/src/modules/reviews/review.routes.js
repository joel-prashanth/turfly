const router = require("express").Router();
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");
const ctrl = require("./review.controller");

// Public — turf reviews
router.get("/turf/:turfId", ctrl.getTurfReviews);

// Player — submit review
router.post("/", authenticate, authorize("PLAYER"), ctrl.createReview);

// Owner — own turf reviews + reply
router.get("/owner", authenticate, authorize("OWNER"), ctrl.getOwnerReviews);
router.patch("/:id/reply", authenticate, authorize("OWNER"), ctrl.replyToReview);

module.exports = router;
