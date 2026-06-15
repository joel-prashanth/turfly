import api from "./axios";

// Existing APIs...

export const createSlot = async (slotData) => {
  const response = await api.post("/slots", slotData);
  return response.data;
};

export const getSlotsByTurfId = async (turfId) => {
  const response = await api.get(`/slots/turf/${turfId}`);
  return response.data;
};

export const getOwnerSchedule = async (date) => {
  const response = await api.get("/slots/schedule", {
    params: { date },
  });

  return response.data;
};

// NEW

export const editSlot = async (slotId, slotData) => {
  const response = await api.patch(`/slots/${slotId}`, slotData);
  return response.data;
};

export const blockSlot = async (slotId) => {
  const response = await api.patch(`/slots/${slotId}/block`);
  return response.data;
};

export const unblockSlot = async (slotId) => {
  const response = await api.patch(`/slots/${slotId}/unblock`);
  return response.data;
};

export const deleteSlot = async (slotId) => {
  const response = await api.delete(`/slots/${slotId}`);
  return response.data;
};
