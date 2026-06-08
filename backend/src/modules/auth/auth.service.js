const prisma = require("../../config/prisma");
const bcrypt = require("bcrypt");

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

module.exports = {
  register,
};
