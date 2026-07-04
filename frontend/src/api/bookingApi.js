import api from "./axios";

export const createBooking = async (slotIds) => {
  const ids = Array.isArray(slotIds) ? slotIds : [slotIds];
  const response = await api.post("/bookings", { slotIds: ids });
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
  const response = await api.patch(`/bookings/${bookingId}/cancel`);
  return response.data;
};

export const ownerCancelBooking = async (bookingId) => {
  const response = await api.patch(`/bookings/${bookingId}/owner-cancel`);
  return response.data;
};

export const getExtendOptions = async (bookingId) => {
  const response = await api.get(`/bookings/${bookingId}/extend-options`);
  return response.data;
};

export const rescheduleBooking = async (bookingId, newSlotId) => {
  const response = await api.patch(`/bookings/${bookingId}/reschedule`, { newSlotId });
  return response.data;
};

export const createManualBooking = async ({ turfId, walkInName, walkInPhone, startTime, endTime }) => {
  const response = await api.post("/bookings/manual", { turfId, walkInName, walkInPhone, startTime, endTime });
  return response.data;
};

export const markAttendance = async (bookingId, status) => {
  const response = await api.patch(`/bookings/${bookingId}/attendance`, { status });
  return response.data;
};