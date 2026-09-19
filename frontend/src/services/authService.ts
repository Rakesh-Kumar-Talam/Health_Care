import API from "./api";
import { PatientVitals } from "../types";

export const authService = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await API.post("/auth/login", credentials);
    return res.data;
  },
  register: async (userData: any) => {
    const res = await API.post("/auth/register", userData);
    return res.data;
  },
  demoLogin: async (role: "patient" | "doctor") => {
    const res = await API.post("/auth/demo-login", { role });
    return res.data;
  },
  getMe: async () => {
    const res = await API.get("/auth/me");
    return res.data;
  },
  updateVitals: async (data: Partial<PatientVitals> & { dateOfBirth?: string }) => {
    const res = await API.put("/auth/vitals", data);
    return res.data;
  },
};