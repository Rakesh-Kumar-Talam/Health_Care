import API from "./api";
import { Medication, PatientVitals } from "../types";

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
  requestRecordAccess: async (id: string) => {
    const res = await API.post(`/appointments/${id}/request-records`);
    return res.data;
  },
  respondRecordAccess: async (id: string, action: "grant" | "deny" | "revoke") => {
    const res = await API.post(`/appointments/${id}/respond-records`, { action });
    return res.data;
  },
  updatePatientVitals: async (
    appointmentId: string,
    vitals: Partial<PatientVitals> & { dateOfBirth?: string }
  ) => {
    const res = await API.put(`/appointments/${appointmentId}/vitals`, vitals);
    return res.data;
  },
};