import API from "./api";

export const statsService = {
  getDoctorDashboardStats: async () => {
    const res = await API.get("/stats/doctor");
    return res.data;
  },
  getPlatformStats: async () => {
    const res = await API.get("/stats/platform");
    return res.data;
  },
};