const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

const authenticate = async (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatarUrl: true,
        avatarPublicId: true,
        notifyNewBooking: true,
        notifyCancellation: true,
        notifyDailySummary: true,
        gstNumber: true,
        businessName: true,
        upiId: true,
        paymentQrUrl: true,
        paymentQrPublicId: true,
        ownerStatus: true,
        ownerStatusReason: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = {
      id: user.id,
      userId: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatarUrl: user.avatarUrl,
      avatarPublicId: user.avatarPublicId,
      notifyNewBooking: user.notifyNewBooking,
      notifyCancellation: user.notifyCancellation,
      notifyDailySummary: user.notifyDailySummary,
      gstNumber: user.gstNumber,
      businessName: user.businessName,
      upiId: user.upiId,
      paymentQrUrl: user.paymentQrUrl,
      paymentQrPublicId: user.paymentQrPublicId,
      ownerStatus: user.ownerStatus,
      ownerStatusReason: user.ownerStatusReason,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

const authenticateOptional = async (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true },
    });
    if (user) req.user = { id: user.id, userId: user.id, role: user.role };
  } catch (_) {}
  next();
};

module.exports = authenticate;
module.exports.authenticateOptional = authenticateOptional;
