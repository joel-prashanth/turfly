import api from "./axios";

export const register = async (userData) => {
  const response = await api.post("/auth/register", userData);

  return response.data;
};

export const login = async (email, password) => {
  const response = await api.post("/auth/login", {
    email,
    password,
  });

  return response.data;
};

export const logout = async () => {
  const response = await api.post("/auth/logout");

  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await api.patch("/auth/profile", data);
  return response.data;
};

export const changePassword = async (currentPassword, newPassword) => {
  const response = await api.patch("/auth/password", { currentPassword, newPassword });
  return response.data;
};

export const updateSettings = async (data) => {
  const response = await api.patch("/auth/settings", data);
  return response.data;
};

