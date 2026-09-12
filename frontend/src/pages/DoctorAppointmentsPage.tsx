import React, { useEffect, useState } from "react";
import { appointmentService } from "../services/appointmentService";
import { Appointment, Medication } from "../types";
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
  Pill,
  Plus,
  Trash2,
  Utensils,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

export const DoctorAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [prescription, setPrescription] = useState<string>("");
  const [medications, setMedications] = useState<Medication[]>([
    {
      medicineName: "",
      frequency: "2 times a day (1-0-1)",
      duration: "5 Days",
      instructions: "After food",
    },
  ]);
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

  const handleAddMedicationRow = () => {
    setMedications((prev) => [
      ...prev,
      {
        medicineName: "",
        frequency: "2 times a day (1-0-1)",
        duration: "5 Days",
        instructions: "After food",
      },
    ]);
  };

  const handleRemoveMedicationRow = (index: number) => {
    setMedications((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMedicationChange = (
    index: number,
    field: keyof Medication,
    value: string
  ) => {
    setMedications((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    );
  };

  const handleAdjustDays = (index: number, delta: number) => {
    setMedications((prev) =>
      prev.map((m, i) => {
        if (i !== index) return m;
        const match = m.duration.match(/\d+/);
        const currentDays = match ? parseInt(match[0], 10) : 5;
        const newDays = Math.max(1, currentDays + delta);
        return {
          ...m,
          duration: `${newDays} ${newDays === 1 ? "Day" : "Days"}`,
        };
      })
    );
  };

  const handleStartEditing = (app: Appointment) => {
    setEditingId(app._id);
    setNotes(app.notes || "");
    setPrescription(app.prescription || "");
    if (app.medications && app.medications.length > 0) {
      setMedications(app.medications);
    } else if (app.prescription) {
      setMedications([
        {
          medicineName: app.prescription,
          frequency: "2 times a day (1-0-1)",
          duration: "5 Days",
          instructions: "After food",
        },
      ]);
    } else {
      setMedications([
        {
          medicineName: "",
          frequency: "2 times a day (1-0-1)",
          duration: "5 Days",
          instructions: "After food",
        },
      ]);
    }
  };

  const handleSaveNotes = async (id: string) => {
    setSaving(true);
    try {
      const validMeds = medications.filter((m) => m.medicineName.trim().length > 0);
      const generatedPrescription =
        prescription ||
        (validMeds.length > 0
          ? validMeds
              .map(
                (m, i) =>
                  `${i + 1}. ${m.medicineName} - ${m.frequency} for ${m.duration} (${m.instructions})`
              )
              .join("\n")
          : "");

      const res = await appointmentService.updateStatus(id, {
        status: "completed",
        notes,
        prescription: generatedPrescription,
        medications: validMeds,
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
                <div className="p-4 sm:p-5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-900 space-y-4">
                  <div className="font-bold text-xs text-teal-900 dark:text-teal-200 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-teal-600" />
                      <span>Write Consultation Diagnosis & Medication Prescription</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddMedicationRow}
                      className="px-2.5 py-1 rounded-lg bg-teal-600 text-white text-[11px] font-bold hover:bg-teal-700 flex items-center gap-1 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Tablet</span>
                    </button>
                  </div>

                  {/* Medications Table Builder */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Prescribed Tablets & Dosage Schedule (Table Format)
                    </div>

                    <div className="space-y-2">
                      {medications.map((med, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                        >
                          <div className="sm:col-span-4">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                              Tablet / Drug Name *
                            </label>
                            <input
                              type="text"
                              value={med.medicineName}
                              onChange={(e) =>
                                handleMedicationChange(idx, "medicineName", e.target.value)
                              }
                              placeholder="e.g. Amlodipine 5mg"
                              className="input-health !py-1.5 !px-2.5 text-xs w-full"
                            />
                          </div>

                          <div className="sm:col-span-3">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                              Times / Day (Frequency)
                            </label>
                            <select
                              value={med.frequency}
                              onChange={(e) =>
                                handleMedicationChange(idx, "frequency", e.target.value)
                              }
                              className="input-health !py-1.5 !px-2 text-xs w-full"
                            >
                              <option value="1 time a day (Morning)">1 time / day (Morning: 1-0-0)</option>
                              <option value="1 time a day (Afternoon)">1 time / day (Afternoon: 0-1-0)</option>
                              <option value="1 time a day (Night)">1 time / day (Night: 0-0-1)</option>
                              <option value="2 times a day (1-0-1)">2 times / day (1-0-1)</option>
                              <option value="3 times a day (1-1-1)">3 times / day (1-1-1)</option>
                              <option value="4 times a day">4 times / day (Every 6h)</option>
                              <option value="As needed (SOS)">As needed (SOS for pain)</option>
                            </select>
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                              Prescribed Days
                            </label>
                            <div className="relative flex items-center">
                              <input
                                type="text"
                                value={med.duration}
                                onChange={(e) =>
                                  handleMedicationChange(idx, "duration", e.target.value)
                                }
                                placeholder="e.g. 5 Days"
                                className="input-health !py-1.5 !pl-2.5 !pr-6 text-xs w-full"
                              />
                              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col items-center">
                                <button
                                  type="button"
                                  title="Increase days"
                                  onClick={() => handleAdjustDays(idx, 1)}
                                  className="text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                                >
                                  <ChevronUp className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  title="Decrease days"
                                  onClick={() => handleAdjustDays(idx, -1)}
                                  className="text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                                >
                                  <ChevronDown className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                              Instructions
                            </label>
                            <select
                              value={med.instructions}
                              onChange={(e) =>
                                handleMedicationChange(idx, "instructions", e.target.value)
                              }
                              className="input-health !py-1.5 !px-2 text-xs w-full"
                            >
                              <option value="After food">After food</option>
                              <option value="Before food (Empty stomach)">Before food</option>
                              <option value="With warm water">With warm water</option>
                              <option value="Before bedtime">Before bedtime</option>
                              <option value="As directed">As directed</option>
                            </select>
                          </div>

                          <div className="sm:col-span-1 flex justify-end sm:justify-center pt-1 sm:pt-3">
                            {medications.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveMedicationRow(idx)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                                title="Remove Tablet"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                      Clinical Diagnosis, Advice & Lifestyle Recommendations
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Advised lifestyle modifications, low sodium diet, hydration..."
                      className="input-health text-xs resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1 border-t border-teal-200 dark:border-teal-900">
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => handleSaveNotes(app._id)}
                      className="btn-primary !py-1.5 !px-4 !text-xs flex items-center gap-1 shadow-sm"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Prescription & Complete</span>
                    </button>
                  </div>
                </div>
              ) : app.notes || app.prescription || (app.medications && app.medications.length > 0) ? (
                <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[10px] uppercase text-teal-700 dark:text-teal-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Completed Consultation & Prescription Record</span>
                    </span>
                  </div>

                  {app.notes && (
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-mono text-[11px]">
                      {app.notes}
                    </p>
                  )}

                  {/* Structured Medication Table Display */}
                  {app.medications && app.medications.length > 0 ? (
                    <div className="overflow-x-auto rounded-xl border border-teal-200/80 dark:border-teal-900/80 bg-white dark:bg-slate-900 shadow-sm mt-2">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-teal-50/70 dark:bg-teal-950/70 border-b border-teal-100 dark:border-teal-900 text-teal-900 dark:text-teal-300 font-bold uppercase tracking-wider text-[10px]">
                            <th className="py-2 px-3 w-8 text-center">#</th>
                            <th className="py-2 px-3">Tablet / Drug Name</th>
                            <th className="py-2 px-3">Times / Day</th>
                            <th className="py-2 px-3">Prescribed Days</th>
                            <th className="py-2 px-3">Instructions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {app.medications.map((m, mIdx) => (
                            <tr key={mIdx} className="hover:bg-teal-50/30 dark:hover:bg-teal-950/20">
                              <td className="py-2 px-3 text-center text-slate-400 font-bold text-[11px]">
                                {mIdx + 1}
                              </td>
                              <td className="py-2 px-3 font-bold text-slate-900 dark:text-white text-[11px]">
                                {m.medicineName}
                              </td>
                              <td className="py-2 px-3 text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold">
                                {m.frequency}
                              </td>
                              <td className="py-2 px-3 text-sky-700 dark:text-sky-400 text-[11px] font-semibold">
                                {m.duration}
                              </td>
                              <td className="py-2 px-3 text-amber-700 dark:text-amber-400 text-[11px]">
                                {m.instructions}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : app.prescription ? (
                    <div className="font-mono text-teal-800 dark:text-teal-300 font-semibold pt-0.5 text-xs">
                      Rx: {app.prescription}
                    </div>
                  ) : null}
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