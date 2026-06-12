import api from "./axios";

export const getTurfs = async () => {
  const response = await api.get("/turfs");
  return response.data;
};

export const getTurfById = async (id) => {
  const response = await api.get(`/turfs/${id}`);
  return response.data;
};

export const getMyTurfs = async () => {
  const response = await api.get("/turfs/my");
  return response.data;
};

export const createTurf = async (turfData) => {
  const response = await api.post("/turfs", turfData);
  return response.data;
};

export const deleteTurf = async (id) => {
  const response = await api.delete(`/turfs/${id}`);
  return response.data;
};
export const updateTurf = async (id, turfData) => {
  const response = await api.put(`/turfs/${id}`, turfData);
  return response.data;
};