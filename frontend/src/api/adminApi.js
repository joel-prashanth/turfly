import api from "./axios";

export const setupAdmin = (data) =>
  api.post("/admin/setup", data).then((r) => r.data);

export const getPlatformStats = () =>
  api.get("/admin/stats").then((r) => r.data);

export const listOwners = (params = {}) =>
  api.get("/admin/owners", { params }).then((r) => r.data);

export const getOwnerDetail = (id) =>
  api.get(`/admin/owners/${id}`).then((r) => r.data);

export const approveOwner = (id) =>
  api.patch(`/admin/owners/${id}/approve`).then((r) => r.data);

export const rejectOwner = (id, reason) =>
  api.patch(`/admin/owners/${id}/reject`, { reason }).then((r) => r.data);

export const suspendOwner = (id, reason) =>
  api.patch(`/admin/owners/${id}/suspend`, { reason }).then((r) => r.data);

export const reactivateOwner = (id) =>
  api.patch(`/admin/owners/${id}/reactivate`).then((r) => r.data);
