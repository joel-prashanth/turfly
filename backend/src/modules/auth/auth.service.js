const prisma = require("../../config/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (userData) => {
  const { name, email, password, role } = userData;

  if (!name || !email || !password || !role) {
    throw new Error("All fields are required");
  }

  //Role validation - only allow "OWNER" and "PLAYER"

  const allowedRoles = ["OWNER", "PLAYER"];

  if (!allowedRoles.includes(role)) {
    throw new Error("Invalid role");
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

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
    },
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
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
    throw new Error("Invalid credentials");
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new Error("Invalid Credentials");
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

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
};

module.exports = {
  register,
  login,
};
