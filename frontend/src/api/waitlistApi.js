import api from "./axios";

export const joinWaitlist  = (slotId) => api.post(`/waitlist/${slotId}`);
export const leaveWaitlist = (slotId) => api.delete(`/waitlist/${slotId}`);
export const getMyWaitlist = ()       => api.get("/waitlist/my");
