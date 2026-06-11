import api from "./axios";

export const createBooking = async (slotId) => {
  const response = await api.post("/bookings", {
    slotId,
  });

  return response.data;
};

export const getMyBookings = async () => {
  const response = await api.get("/bookings/my");

  return response.data;
};