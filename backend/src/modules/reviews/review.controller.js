const service = require("./review.service");

const createReview = async (req, res) => {
  try {
    const review = await service.createReview(req.user.userId, req.body);
    return res.status(201).json({ success: true, review });
  } catch (e) {
    return res.status(400).json({ success: false, message: e.message });
  }
};

const getTurfReviews = async (req, res) => {
  try {
    const { turfId } = req.params;
    const { page, limit } = req.query;
    const data = await service.getTurfReviews(turfId, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    });
    return res.json({ success: true, ...data });
  } catch (e) {
    return res.status(400).json({ success: false, message: e.message });
  }
};

const getOwnerReviews = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const data = await service.getOwnerReviews(req.user.userId, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    });
    return res.json({ success: true, ...data });
  } catch (e) {
    return res.status(400).json({ success: false, message: e.message });
  }
};

const replyToReview = async (req, res) => {
  try {
    const review = await service.replyToReview(
      req.params.id,
      req.user.userId,
      req.body.reply,
    );
    return res.json({ success: true, review });
  } catch (e) {
    return res.status(400).json({ success: false, message: e.message });
  }
};

module.exports = { createReview, getTurfReviews, getOwnerReviews, replyToReview };
