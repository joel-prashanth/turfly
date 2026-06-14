import api from "./axios";

export const getOwnerDashboardStats = async () => {
  const response = await api.get("/dashboard/owner");

  return response.data;
};
