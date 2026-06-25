const svc = require("./report.service");

const submitReport = async (req, res) => {
  try {
    const result = await svc.submitReport(req.params.turfId, req.user.id, req.body);
    res.status(201).json({ success: true, message: result.message });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const listReports = async (req, res) => {
  try {
    const data = await svc.listReports(req.query);
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const dismissReport = async (req, res) => {
  try {
    await svc.dismissReport(req.params.id);
    res.json({ success: true, message: "Report dismissed." });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = { submitReport, listReports, dismissReport };
