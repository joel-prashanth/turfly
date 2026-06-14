import api from "./axios";

export const getRevenueAnalytics = async (days = 7) => {
  const response = await api.get(
    `/dashboard/owner/analytics/revenue?days=${days}`,
  );

  return response.data;
};
