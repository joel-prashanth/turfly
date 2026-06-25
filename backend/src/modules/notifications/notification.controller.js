const svc = require("./notification.service");

const getNotifications = async (req, res) => {
  try {
    const notifications = await svc.getNotifications(req.user.userId);
    const unread = await svc.getUnreadCount(req.user.userId);
    res.json({ success: true, notifications, unread });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const markAllRead = async (req, res) => {
  try {
    await svc.markAllRead(req.user.userId);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const markOneRead = async (req, res) => {
  try {
    await svc.markOneRead(req.params.id, req.user.userId);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const clearAll = async (req, res) => {
  try {
    await svc.clearAll(req.user.userId);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

module.exports = { getNotifications, markAllRead, markOneRead, clearAll };
