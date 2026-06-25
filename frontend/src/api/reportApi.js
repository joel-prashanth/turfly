import api from "./axios";

export const submitReport = (turfId, data) =>
  api.post(`/reports/turfs/${turfId}`, data).then((r) => r.data);

export const listReports = (params) =>
  api.get("/reports", { params }).then((r) => r.data);

export const dismissReport = (id) =>
  api.patch(`/reports/${id}/dismiss`).then((r) => r.data);
