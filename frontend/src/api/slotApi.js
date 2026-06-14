import api from "./axios";

export const getSlotsByTurfId = async (turfId) => {
  const response = await api.get(`/slots/turf/${turfId}`);

  return response.data;
};

export const createSlot = async (slotData) => {
  const response = await api.post("/slots", slotData);

  return response.data;
};

export const getOwnerSchedule = async (date) => {
  const response = await api.get("/slots/schedule", {
    params: {
      date,
    },
  });

  return response.data;
};
