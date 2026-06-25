const authService = require("./auth.service");

// REGISTER CONTROLLER
const registerController = async (req, res) => {
  try {
    const result = await authService.register(req.body);

    res.cookie("accessToken", result.token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      data: { user: result.user },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// LOGIN CONTROLLER
const loginController = async (req, res) => {
  try {
    const result = await authService.login(req.body);

    res.cookie("accessToken", result.token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      data: {
        user: result.user,
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// LOGOUT CONTROLLER
const logoutController = async (req, res) => {
  res.clearCookie("accessToken");

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

// CURRENT USER CONTROLLER
const getCurrentUser = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
};

const updateProfileController = async (req, res) => {
  try {
    const { userId } = req.user;
    const updated = await authService.updateProfile(userId, req.body);
    return res.status(200).json({ success: true, data: { user: updated } });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const changePasswordController = async (req, res) => {
  try {
    const { userId } = req.user;
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword(userId, currentPassword, newPassword);
    return res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const updateSettingsController = async (req, res) => {
  try {
    const { userId } = req.user;
    const updated = await authService.updateSettings(userId, req.body);
    return res.status(200).json({ success: true, data: { user: updated } });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerController,
  loginController,
  logoutController,
  getCurrentUser,
  updateProfileController,
  changePasswordController,
  updateSettingsController,
};