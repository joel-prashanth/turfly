const prisma = require("../../config/prisma");

const register = async (userData) => {
  const { name, email, password, role } = userData;

  console.log({
    name,
    email,
    password,
    role,
  });

  return {
    message: "Register service reached",
  };
};

module.exports = {
  register,
};
