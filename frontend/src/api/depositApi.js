import api from "./axios";

export const createDepositOrder = (bookingId) =>
  api.post("/deposit/order", { bookingId }).then((r) => r.data);

export const verifyDepositPayment = (data) =>
  api.post("/deposit/verify", data).then((r) => r.data);

export const markAttendance = (bookingId, attended) =>
  api.post(`/deposit/${bookingId}/attendance`, { attended }).then((r) => r.data);
