import API from "./api";

export const doctorService = {
  getDoctors: async (params?: Record<string, any>) => {
    const res = await API.get("/doctors", { params });
    return res.data;
  },
  getSpecialties: async () => {
    const res = await API.get("/doctors/specialties");
    return res.data;
  },
  getDoctorById: async (id: string) => {
    const res = await API.get(`/doctors/${id}`);
    return res.data;
  },
  updateProfile: async (data: any) => {
    const res = await API.put("/doctors/profile", data);
    return res.data;
  },
};