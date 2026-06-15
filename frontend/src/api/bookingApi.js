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

export const getOwnerBookings = async ({
  page = 1,
  limit = 10,
  search = "",
  status = "ALL",
} = {}) => {
  const response = await api.get("/bookings/owner", {
    params: {
      page,
      limit,
      search,
      status,
    },
  });

  return response.data;
};

export const cancelBooking = async (bookingId) => {
  const response = await api.patch(
    `/bookings/${bookingId}/cancel`
  );

  return response.data;
};