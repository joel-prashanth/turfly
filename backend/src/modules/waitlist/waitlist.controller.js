const service = require("./waitlist.service");

const join = async (req, res) => {
  try {
    const result = await service.joinWaitlist(req.user.userId, req.params.slotId);
    return res.status(201).json({ success: true, message: result.message });
  } catch (e) {
    return res.status(400).json({ success: false, message: e.message });
  }
};

const leave = async (req, res) => {
  try {
    const result = await service.leaveWaitlist(req.user.userId, req.params.slotId);
    return res.json({ success: true, message: result.message });
  } catch (e) {
    return res.status(400).json({ success: false, message: e.message });
  }
};

const getMyWaitlist = async (req, res) => {
  try {
    const entries = await service.getMyWaitlist(req.user.userId);
    return res.json({ success: true, waitlist: entries });
  } catch (e) {
    return res.status(400).json({ success: false, message: e.message });
  }
};

module.exports = { join, leave, getMyWaitlist };
