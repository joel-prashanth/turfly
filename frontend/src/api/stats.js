import api from "./axios";

export const getPlatformStats = async () => {
  const response = await api.get("/stats");

  return response.data;
};
