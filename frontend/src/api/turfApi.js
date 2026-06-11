import api from "./axios";

export const getTurfs = async () => {
  const response = await api.get("/turfs");
  return response.data;
};
