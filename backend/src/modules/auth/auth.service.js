const prisma = require("../../config/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  avatarUrl: true,
  avatarPublicId: true,
  cooldownUntil: true,
  cooldownReason: true,
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
  verificationDocUrl: true,
  verificationDocPublicId: true,
  verificationDocType: true,
};

const register = async (userData) => {
  const { name, email, phone, password, role } = userData;

  if (!name || !email || !phone || !password || !role) {
    throw new Error("All fields are required");
  }

  //Role validation - only allow "OWNER" and "PLAYER"

  const allowedRoles = ["OWNER", "PLAYER"];

  if (!allowedRoles.includes(role)) {
    throw new Error("Invalid role");
  }

  const phoneRegex = /^[6-9]\d{9}$/;

  if (!phoneRegex.test(phone)) {
    throw new Error("Please enter a valid 10-digit mobile number");
  }

  //Check for duplicate users based on email

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (existingUser) {
    throw new Error("Email already exists");
  }

  //Hashing password

  const saltRounds = 10;

  const passwordHash = await bcrypt.hash(password, saltRounds);

  //Create User

  const created = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      passwordHash,
      role,
      // New owner registrations start in review queue
      ...(role === "OWNER" && { ownerStatus: "PENDING_REVIEW" }),
    },
  });

  const token = jwt.sign(
    { userId: created.id, role: created.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  const user = await prisma.user.findUnique({
    where: { id: created.id },
    select: USER_SELECT,
  });

  return { user, token };
};

const login = async (credentials) => {
  const { email, password } = credentials;

  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new Error("Invalid Credentials");
  }

  if (user.role === "OWNER" && user.ownerStatus === "SUSPENDED") {
    const reason = user.ownerStatusReason
      ? ` Reason: ${user.ownerStatusReason}`
      : "";
    throw new Error(`Your account has been suspended.${reason} Contact support@turfly.in to appeal.`);
  }

  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );

  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: USER_SELECT,
  });

  return { user: fullUser, token };
};
const getCurrentUser = async (userId) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: USER_SELECT,
  });
};

const updateProfile = async (userId, data) => {
  const { name, phone, avatarUrl, avatarPublicId } = data;

  if (name !== undefined && !name.trim()) {
    throw new Error("Name cannot be empty.");
  }

  if (phone !== undefined) {
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      throw new Error("Please enter a valid 10-digit mobile number.");
    }
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(phone !== undefined && { phone }),
      ...(avatarUrl !== undefined && { avatarUrl }),
      ...(avatarPublicId !== undefined && { avatarPublicId }),
    },
    select: USER_SELECT,
  });

  return updated;
};

const changePassword = async (userId, currentPassword, newPassword) => {
  if (!currentPassword || !newPassword) {
    throw new Error("Current and new password are required.");
  }

  if (newPassword.length < 6) {
    throw new Error("New password must be at least 6 characters.");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) throw new Error("Current password is incorrect.");

  if (currentPassword === newPassword) {
    throw new Error("New password must be different from your current password.");
  }

  const hash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: hash } });

  return { message: "Password updated successfully." };
};

const updateSettings = async (userId, data) => {
  const {
    notifyNewBooking,
    notifyCancellation,
    notifyDailySummary,
    gstNumber,
    businessName,
    upiId,
    paymentQrUrl,
    paymentQrPublicId,
    verificationDocUrl,
    verificationDocPublicId,
    verificationDocType,
  } = data;

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(notifyNewBooking !== undefined && { notifyNewBooking }),
      ...(notifyCancellation !== undefined && { notifyCancellation }),
      ...(notifyDailySummary !== undefined && { notifyDailySummary }),
      ...(gstNumber !== undefined && { gstNumber: gstNumber || null }),
      ...(businessName !== undefined && { businessName: businessName || null }),
      ...(upiId !== undefined && { upiId: upiId || null }),
      ...(paymentQrUrl !== undefined && { paymentQrUrl: paymentQrUrl || null }),
      ...(paymentQrPublicId !== undefined && { paymentQrPublicId: paymentQrPublicId || null }),
      ...(verificationDocUrl !== undefined && { verificationDocUrl: verificationDocUrl || null }),
      ...(verificationDocPublicId !== undefined && { verificationDocPublicId: verificationDocPublicId || null }),
      ...(verificationDocType !== undefined && { verificationDocType: verificationDocType || null }),
    },
    select: USER_SELECT,
  });

  return updated;
};

module.exports = {
  register,
  login,
  getCurrentUser,
  updateProfile,
  changePassword,
  updateSettings,
};
