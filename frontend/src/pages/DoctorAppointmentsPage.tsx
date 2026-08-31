import React, { useEffect, useState } from "react";
import { appointmentService } from "../services/appointmentService";
import { Appointment } from "../types";
import { Badge } from "../components/common/Badge";
import {
  Calendar,
  Clock,
  Video,
  Building2,
  CheckCircle2,
  FileText,
  Save,
  Search,
  User,
  Phone,
  Mail,
  AlertCircle,
} from "lucide-react";

export const DoctorAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [prescription, setPrescription] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentService.getDoctorAppointments({
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
      if (res.success) setAppointments(res.appointments);
    } catch (err) {
      console.error("Failed to load doctor appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter]);

  const handleStartEditing = (app: Appointment) => {
    setEditingId(app._id);
    setNotes(app.notes || "");
    setPrescription(app.prescription || "");
  };

  const handleSaveNotes = async (id: string) => {
    setSaving(true);
    try {
      const res = await appointmentService.updateStatus(id, {
        status: "completed",
        notes,
        prescription,
      });
      if (res.success) {
        setAppointments((prev) =>
          prev.map((a) => (a._id === id ? res.appointment : a))
        );
        setEditingId(null);
      }
    } catch (err) {
      console.error("Failed to save prescription notes:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm("Cancel this appointment?")) return;
    try {
      const res = await appointmentService.cancelAppointment(id);
      if (res.success) {
        setAppointments((prev) =>
          prev.map((a) => (a._id === id ? { ...a, status: "cancelled" } : a))
        );
      }
    } catch (err) {
      console.error("Failed to cancel appointment:", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-bold mb-2 border border-teal-200 dark:border-teal-800">
          <Calendar className="w-3.5 h-3.5 text-teal-600" />
          <span>Clinical Patient Consultations</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
          Manage Patient Appointments
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review patient records, update status, and issue clinical diagnosis notes and prescriptions
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {["all", "confirmed", "completed", "cancelled"].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
              statusFilter === st
                ? "bg-teal-600 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="space-y-4">
          <div className="card-health p-6 animate-pulse h-32"></div>
          <div className="card-health p-6 animate-pulse h-32"></div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="card-health p-12 text-center text-slate-500">
          No appointments found in this category.
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((app) => (
            <div
              key={app._id}
              className="card-health p-5 sm:p-6 space-y-4 transition-all hover:border-slate-300 dark:hover:border-slate-700"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                      {app.patientName}
                    </span>
                    <Badge variant={app.status === "confirmed" ? "success" : app.status === "completed" ? "primary" : "danger"}>
                      {app.status}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {app.patientEmail}
                    </span>
                    {app.patientPhone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {app.patientPhone}
                      </span>
                    )}
                  </div>
                </div>

                {/* Date & Time Slot */}
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-teal-600" />
                    <span>{app.appointmentDate}</span>
                    <span>•</span>
                    <Clock className="w-4 h-4 text-teal-600" />
                    <span>{app.timeSlot}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5">
                    {app.type === "video" ? (
                      <span className="text-sky-600 dark:text-sky-400 flex items-center gap-1">
                        <Video className="w-3.5 h-3.5" /> Video Telehealth
                      </span>
                    ) : (
                      <span className="text-teal-600 dark:text-teal-400 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" /> In-Person
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Patient Symptoms and Reason */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-xs space-y-1">
                <div className="font-bold text-slate-700 dark:text-slate-300">
                  Reason for Visit: {app.reason}
                </div>
                {app.symptoms && (
                  <div className="text-slate-500 dark:text-slate-400 italic">
                    Symptoms reported: {app.symptoms}
                  </div>
                )}
              </div>

              {/* Prescription / Notes Editor or Display */}
              {editingId === app._id ? (
                <div className="p-4 rounded-xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 space-y-3">
                  <div className="font-bold text-xs text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-teal-600" />
                    <span>Write Consultation Notes & Prescription</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                      Clinical Notes & Advice
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Advised lifestyle modifications, low sodium diet, hydration..."
                      className="input-health text-xs resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                      Prescription (Rx)
                    </label>
                    <input
                      type="text"
                      value={prescription}
                      onChange={(e) => setPrescription(e.target.value)}
                      placeholder="e.g. Amlodipine 5mg OD x 30 days"
                      className="input-health text-xs"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => handleSaveNotes(app._id)}
                      className="btn-primary !py-1.5 !px-4 !text-xs flex items-center gap-1"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save & Complete</span>
                    </button>
                  </div>
                </div>
              ) : app.notes ? (
                <div className="p-3.5 rounded-xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 text-xs space-y-1">
                  <span className="font-bold text-[10px] uppercase text-teal-700 dark:text-teal-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Completed Consultation Record</span>
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{app.notes}</p>
                  {app.prescription && (
                    <div className="font-mono text-teal-800 dark:text-teal-300 font-semibold pt-0.5">
                      Rx: {app.prescription}
                    </div>
                  )}
                </div>
              ) : null}

              {/* Actions */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-400">
                  Fee: <strong className="text-slate-700 dark:text-slate-200">${app.fee}</strong>
                </span>

                <div className="flex items-center gap-2">
                  {editingId !== app._id && app.status !== "completed" && app.status !== "cancelled" && (
                    <button
                      onClick={() => handleStartEditing(app)}
                      className="btn-primary !py-1.5 !px-3.5 !text-xs flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Add Prescription / Complete</span>
                    </button>
                  )}

                  {app.status === "confirmed" && (
                    <button
                      onClick={() => handleCancel(app._id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};