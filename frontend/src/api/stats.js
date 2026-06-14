import api from "./axios";

export const getPlatformStats = async () => {
  const response = await api.get("/stats");

  console.log("Stats API Response:", response.data);

  return response.data.stats;
};