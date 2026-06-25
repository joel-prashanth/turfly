import api from "./axios";

export const getTurfs = async (filters = {}) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value);
    }
  });

  const response = await api.get(`/turfs?${params.toString()}`);

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

export const setTurfListingStatus = async (id, isActive) => {
  const response = await api.patch(`/turfs/${id}/listing`, { isActive });
  return response.data;
};