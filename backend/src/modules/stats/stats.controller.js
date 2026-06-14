const statsService = require("./stats.service");

const getPlatformStats = async (req, res) => {
  try {
    const stats = await statsService.getPlatformStats();

    return res.status(200).json({
      success: true,
      stats,
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
  getPlatformStats,
};
