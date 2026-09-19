import API from "./api";
import { HealthRecord, RecordCategory, Medication, Patient } from "../types";

export interface RecordQueryParams {
  category?: string;
  search?: string;
  sort?: "newest" | "oldest";
}

export interface CreateRecordPayload {
  title: string;
  category: RecordCategory;
  recordDate?: string;
  doctorName?: string;
  hospitalName?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: string;
  description?: string;
  medications?: Medication[];
  tags?: string[];
}

export const recordService = {
  getMyRecords: async (params?: RecordQueryParams) => {
    const res = await API.get("/records", { params });
    return res.data as {
      success: boolean;
      count: number;
      counts: {
        total: number;
        prescription: number;
        scanning: number;
        lab_report: number;
        discharge_summary: number;
        other: number;
      };
      records: HealthRecord[];
    };
  },

  getPatientRecords: async (patientUserId: string, params?: RecordQueryParams) => {
    const res = await API.get(`/records/patient/${patientUserId}`, { params });
    return res.data as {
      success: boolean;
      count: number;
      counts: {
        total: number;
        prescription: number;
        scanning: number;
        lab_report: number;
        discharge_summary: number;
        other: number;
      };
      patientProfile?: Patient;
      records: HealthRecord[];
    };
  },

  getRecordById: async (id: string) => {
    const res = await API.get(`/records/${id}`);
    return res.data as { success: boolean; record: HealthRecord };
  },

  createRecord: async (data: CreateRecordPayload) => {
    const res = await API.post("/records", data);
    return res.data as { success: boolean; message: string; record: HealthRecord };
  },

  updateRecord: async (id: string, data: Partial<CreateRecordPayload>) => {
    const res = await API.put(`/records/${id}`, data);
    return res.data as { success: boolean; message: string; record: HealthRecord };
  },

  deleteRecord: async (id: string) => {
    const res = await API.delete(`/records/${id}`);
    return res.data as { success: boolean; message: string };
  },
};
