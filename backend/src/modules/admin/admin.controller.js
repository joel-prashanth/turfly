const adminService = require("./admin.service");

const setupAdmin = async (req, res) => {
  try {
    const admin = await adminService.setupAdmin(req.body);
    res.status(201).json({ success: true, message: "Admin account created.", data: admin });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const listOwners = async (req, res) => {
  try {
    const { status, search, page, limit } = req.query;
    const result = await adminService.listOwners({ status, search, page, limit });
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const getOwnerDetail = async (req, res) => {
  try {
    const owner = await adminService.getOwnerDetail(req.params.id);
    res.json({ success: true, data: owner });
  } catch (err) {
    console.error("[getOwnerDetail]", err);
    res.status(404).json({ success: false, message: err.message });
  }
};

const approveOwner = async (req, res) => {
  try {
    const owner = await adminService.approveOwner(req.params.id);
    res.json({ success: true, message: "Owner approved.", data: owner });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const rejectOwner = async (req, res) => {
  try {
    const owner = await adminService.rejectOwner(req.params.id, req.body.reason);
    res.json({ success: true, message: "Owner rejected.", data: owner });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const suspendOwner = async (req, res) => {
  try {
    const owner = await adminService.suspendOwner(req.params.id, req.body.reason);
    res.json({ success: true, message: "Owner suspended.", data: owner });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const reactivateOwner = async (req, res) => {
  try {
    const owner = await adminService.reactivateOwner(req.params.id);
    res.json({ success: true, message: "Owner reactivated.", data: owner });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const getPlatformStats = async (req, res) => {
  try {
    const stats = await adminService.getPlatformStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  setupAdmin,
  listOwners,
  getOwnerDetail,
  approveOwner,
  rejectOwner,
  suspendOwner,
  reactivateOwner,
  getPlatformStats,
};
