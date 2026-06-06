const authService = require("./auth.service");

const registerController = async (req, res) => {
  try {
    const result = await authService.register(req.body);
    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  registerController,
};
