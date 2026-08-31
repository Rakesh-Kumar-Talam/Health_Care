import API from "./api";

export const hospitalService = {
  getHospitals: async (params?: Record<string, any>) => {
    const res = await API.get("/hospitals", { params });
    return res.data;
  },
  getHospitalById: async (id: string) => {
    const res = await API.get(`/hospitals/${id}`);
    return res.data;
  },
};