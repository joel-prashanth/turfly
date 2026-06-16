const dashboardService = require("./dashboard.service");
const analyticsService = require("./analytics.service");

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

const getOwnerRecentBookings = async (req, res) => {
  try {
    const bookings = await dashboardService.getOwnerRecentBookings(req.user.id);

    return res.status(200).json({
      success: true,
      data: {
        bookings,
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

const getRevenueAnalytics = async (req, res) => {
  try {
    const days = Number(req.query.days) || 7;

    const revenue = await analyticsService.getRevenueAnalytics(
      req.user.id,
      days,
    );

    return res.status(200).json({
      success: true,
      data: {
        revenue,
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

const getOwnerTodayCalendar = async (req, res) => {
  try {
    const schedule = await dashboardService.getOwnerTodayCalendar(req.user.id);

    return res.status(200).json({
      success: true,
      data: {
        schedule,
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
  getOwnerRecentBookings,
  getRevenueAnalytics,
  getOwnerTodayCalendar,
};
