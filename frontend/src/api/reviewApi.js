import api from "./axios";

export const createReview = (bookingId, rating, comment) =>
  api.post("/reviews", { bookingId, rating, comment });

export const getTurfReviews = (turfId, params = {}) =>
  api.get(`/reviews/turf/${turfId}`, { params });

export const getOwnerReviews = (params = {}) =>
  api.get("/reviews/owner", { params });

export const replyToReview = (reviewId, reply) =>
  api.patch(`/reviews/${reviewId}/reply`, { reply });
