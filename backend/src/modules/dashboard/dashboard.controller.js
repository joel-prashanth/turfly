const dashboardService = require("./dashboard.service");

const getOwnerDashboardStats = async (req, res) => {
  try {
    const stats = await dashboardService.getOwnerDashboardStats(req.user.id);

    return res.status(200).json({
      success: true,
      data: {
        stats,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getOwnerDashboardStats,
};