import API from "./api";
import { Medication } from "../types";

export const appointmentService = {
  bookAppointment: async (data: any) => {
    const res = await API.post("/appointments/book", data);
    return res.data;
  },
  getMyPatientAppointments: async (status?: string) => {
    const res = await API.get("/appointments/my", { params: { status } });
    return res.data;
  },
  getDoctorAppointments: async (params?: { status?: string; date?: string }) => {
    const res = await API.get("/appointments/doctor", { params });
    return res.data;
  },
  updateStatus: async (
    id: string,
    data: {
      status?: string;
      notes?: string;
      prescription?: string;
      medications?: Medication[];
    }
  ) => {
    const res = await API.patch(`/appointments/${id}/status`, data);
    return res.data;
  },
  cancelAppointment: async (id: string) => {
    const res = await API.patch(`/appointments/${id}/cancel`);
    return res.data;
  },
};