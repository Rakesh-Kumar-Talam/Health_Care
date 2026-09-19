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
  Package,
  Sparkles,
  BookmarkPlus,
  Pencil,
  Settings2,
  RotateCcw,
  Check,
  Activity,
  Heart,
  Lock,
  ShieldCheck,
} from "lucide-react";
import {
  BUILT_IN_CLINICAL_KITS,
  getCustomKits,
  saveCustomKit,
  calculateTotalQuantity,
  ClinicalKit,
  getQuickApplyKitIds,
  saveQuickApplyKitIds,
  DEFAULT_QUICK_APPLY_KIT_IDS,
} from "../utils/prescriptionHelpers";
import { PatientRecordsModal } from "../components/doctor/PatientRecordsModal";

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
  const [customKits, setCustomKits] = useState<ClinicalKit[]>([]);
  const [selectedKitId, setSelectedKitId] = useState<string>("");
  const [showSaveKitModal, setShowSaveKitModal] = useState<boolean>(false);
  const [newKitName, setNewKitName] = useState<string>("");
  const [newKitTag, setNewKitTag] = useState<string>("General");
  const [quickKitIds, setQuickKitIds] = useState<string[]>(getQuickApplyKitIds);
  const [showEditQuickTabsModal, setShowEditQuickTabsModal] = useState<boolean>(false);
  const [tempQuickKitIds, setTempQuickKitIds] = useState<string[]>([]);
  const [activePatientForRecords, setActivePatientForRecords] = useState<{
    patientUserId: string;
    patientName: string;
    patientEmail?: string;
    patientPhone?: string;
  } | null>(null);
  const [requestingRecordId, setRequestingRecordId] = useState<string | null>(null);

  const handleRequestRecordAccess = async (appId: string) => {
    setRequestingRecordId(appId);
    try {
      const res = await appointmentService.requestRecordAccess(appId);
      if (res.success) {
        setAppointments((prev) =>
          prev.map((a) => (a._id === appId ? { ...a, recordAccessStatus: "requested" } : a))
        );
      }
    } catch (err: any) {
      console.error("Failed to request patient records:", err);
      alert(err.response?.data?.message || "Failed to send record access request to patient. Please try again.");
    } finally {
      setRequestingRecordId(null);
    }
  };

  // Doctor Patient Vitals State & Handlers
  const [selectedApptForVitals, setSelectedApptForVitals] = useState<Appointment | null>(null);
  const [savingDoctorVitals, setSavingDoctorVitals] = useState<boolean>(false);
  const [doctorVitalsForm, setDoctorVitalsForm] = useState({
    systolic: "120",
    diastolic: "80",
    heightCm: "172",
    weightKg: "68",
    dateOfBirth: "1996-05-14",
    fastingSugar: "94",
    postPrandialSugar: "130",
  });

  const handleOpenVitalsModal = (app: Appointment) => {
    setSelectedApptForVitals(app);
    setDoctorVitalsForm({
      systolic: app.patientVitals?.bloodPressure?.systolic?.toString() || "120",
      diastolic: app.patientVitals?.bloodPressure?.diastolic?.toString() || "80",
      heightCm: app.patientVitals?.heightCm?.toString() || "172",
      weightKg: app.patientVitals?.weightKg?.toString() || "68",
      dateOfBirth: app.patientDob ? new Date(app.patientDob).toISOString().split("T")[0] : "1996-05-14",
      fastingSugar: app.patientVitals?.bloodSugar?.fasting?.toString() || "94",
      postPrandialSugar: app.patientVitals?.bloodSugar?.postPrandial?.toString() || "130",
    });
  };

  const handleSaveDoctorVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApptForVitals) return;

    setSavingDoctorVitals(true);
    try {
      const payload = {
        bloodPressure: {
          systolic: doctorVitalsForm.systolic ? Number(doctorVitalsForm.systolic) : undefined,
          diastolic: doctorVitalsForm.diastolic ? Number(doctorVitalsForm.diastolic) : undefined,
        },
        heightCm: doctorVitalsForm.heightCm ? Number(doctorVitalsForm.heightCm) : undefined,
        weightKg: doctorVitalsForm.weightKg ? Number(doctorVitalsForm.weightKg) : undefined,
        bloodSugar: {
          fasting: doctorVitalsForm.fastingSugar ? Number(doctorVitalsForm.fastingSugar) : undefined,
          postPrandial: doctorVitalsForm.postPrandialSugar ? Number(doctorVitalsForm.postPrandialSugar) : undefined,
        },
        dateOfBirth: doctorVitalsForm.dateOfBirth || undefined,
      };

      const res = await appointmentService.updatePatientVitals(selectedApptForVitals._id, payload);
      if (res.success) {
        setAppointments((prev) =>
          prev.map((a) =>
            a._id === selectedApptForVitals._id
              ? {
                  ...a,
                  patientVitals: res.vitals || payload,
                  patientDob: payload.dateOfBirth,
                }
              : a
          )
        );
        setSelectedApptForVitals(null);
      }
    } catch (err: any) {
      console.error("Failed to update patient vitals:", err);
      alert(err.response?.data?.message || "Failed to update patient vitals. Please try again.");
    } finally {
      setSavingDoctorVitals(false);
    }
  };

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

  useEffect(() => {
    setCustomKits(getCustomKits());
  }, []);

  const allAvailableKits = [...customKits, ...BUILT_IN_CLINICAL_KITS];

  const handleApplyKit = (kitId: string) => {
    if (!kitId) return;
    const kit = allAvailableKits.find((k) => k.id === kitId);
    if (!kit) return;
    setMedications(kit.medications.map((m) => ({ ...m })));
    setSelectedKitId(kitId);
  };

  const handleSaveCurrentAsKit = () => {
    const validMeds = medications.filter((m) => m.medicineName.trim().length > 0);
    if (validMeds.length === 0) {
      alert("Please enter at least one valid medication before saving as a kit.");
      return;
    }
    if (!newKitName.trim()) {
      alert("Please provide a name for your clinical kit.");
      return;
    }
    const saved = saveCustomKit({
      name: newKitName.trim(),
      tag: newKitTag.trim() || "General Practice",
      description: `Doctor custom regimen (${validMeds.length} medicines)`,
      medications: validMeds,
    });
    setCustomKits((prev) => [saved, ...prev]);
    setSelectedKitId(saved.id);
    setQuickKitIds((prev) => {
      const updated = [saved.id, ...prev];
      saveQuickApplyKitIds(updated);
      return updated;
    });
    setShowSaveKitModal(false);
    setNewKitName("");
  };

  const handleOpenEditQuickTabs = () => {
    setTempQuickKitIds([...quickKitIds]);
    setShowEditQuickTabsModal(true);
  };

  const handleToggleQuickKit = (kitId: string) => {
    setTempQuickKitIds((prev) =>
      prev.includes(kitId) ? prev.filter((id) => id !== kitId) : [...prev, kitId]
    );
  };

  const handleSaveQuickTabs = () => {
    if (tempQuickKitIds.length === 0) {
      alert("Please keep at least 1 kit in Quick Apply tabs.");
      return;
    }
    setQuickKitIds(tempQuickKitIds);
    saveQuickApplyKitIds(tempQuickKitIds);
    setShowEditQuickTabsModal(false);
  };

  const handleResetQuickTabs = () => {
    setTempQuickKitIds(DEFAULT_QUICK_APPLY_KIT_IDS);
  };

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

              {/* Patient Clinical Vitals & Last Updated Strip */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-teal-50/70 to-sky-50/70 dark:from-teal-950/30 dark:to-sky-950/30 border border-teal-200/70 dark:border-teal-900/60 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-teal-900 dark:text-teal-200">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span>Patient Vitals:</span>
                  </div>
                  {app.patientVitals ? (
                    <>
                      <span className="text-slate-700 dark:text-slate-200">
                        BP: <strong>{app.patientVitals.bloodPressure?.systolic || 120}/{app.patientVitals.bloodPressure?.diastolic || 80} mmHg</strong>
                      </span>
                      <span className="text-slate-700 dark:text-slate-200">
                        Height: <strong>{app.patientVitals.heightCm || 172} cm</strong>
                      </span>
                      <span className="text-slate-700 dark:text-slate-200">
                        Weight: <strong>{app.patientVitals.weightKg || 68} kg</strong>
                      </span>
                      {app.patientVitals.bloodSugar?.fasting && (
                        <span className="text-slate-700 dark:text-slate-200">
                          Fasting Sugar: <strong>{app.patientVitals.bloodSugar.fasting} mg/dL</strong>
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-slate-500 italic">
                      No vitals recorded yet for this patient
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 flex-shrink-0">
                  <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>
                    Last Updated:{" "}
                    <strong className="text-slate-800 dark:text-slate-200">
                      {app.patientVitals?.lastUpdated
                        ? new Date(app.patientVitals.lastUpdated).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Never recorded"}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Prescription / Notes Editor or Display */}
              {editingId === app._id ? (
                <div className="p-4 sm:p-5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-900 space-y-4">
                  <div className="font-bold text-xs text-teal-900 dark:text-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-teal-600" />
                      <span>Write Consultation Diagnosis & Medication Prescription</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {app.status === "confirmed" && (
                        app.recordAccessStatus === "granted" ? (
                          <button
                            type="button"
                            onClick={() => {
                              const rawId = app.patientUserId || (app as any).patientId || "";
                              const safeId = typeof rawId === "object" && rawId !== null ? (rawId as any)._id || String(rawId) : String(rawId);
                              setActivePatientForRecords({
                                patientUserId: safeId,
                                patientName: app.patientName,
                                patientEmail: app.patientEmail,
                                patientPhone: app.patientPhone,
                              });
                            }}
                            className="px-2.5 py-1 rounded-lg bg-teal-100/80 dark:bg-teal-900/60 hover:bg-teal-200 dark:hover:bg-teal-800 text-teal-800 dark:text-teal-200 text-[11px] font-bold flex items-center gap-1 border border-teal-300 dark:border-teal-700 transition-colors shadow-2xs"
                            title="View patient's previous prescriptions, lab reports & allergies"
                          >
                            <Activity className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                            <span>View Past Records</span>
                          </button>
                        ) : app.recordAccessStatus === "requested" ? (
                          <span className="px-2 py-1 rounded-lg bg-amber-100/80 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-[11px] font-medium border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-500 animate-pulse" />
                            <span>Records Pending Approval</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={requestingRecordId === app._id}
                            onClick={() => handleRequestRecordAccess(app._id)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold flex items-center gap-1 border border-slate-300 dark:border-slate-700 transition-colors"
                            title="Ask patient to grant record access"
                          >
                            <Lock className="w-3 h-3 text-slate-500" />
                            <span>{requestingRecordId === app._id ? "Sending..." : "Request Records"}</span>
                          </button>
                        )
                      )}
                      <button
                        type="button"
                        onClick={handleAddMedicationRow}
                        className="px-2.5 py-1 rounded-lg bg-teal-600 text-white text-[11px] font-bold hover:bg-teal-700 flex items-center gap-1 shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Tablet</span>
                      </button>
                    </div>
                  </div>

                  {/* 1-Click Clinical Kits & Templates Toolbar */}
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-800/80 space-y-2 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                            <span>Clinical Kits & Templates</span>
                            <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.5 rounded-full">
                              1-Click Fill
                            </span>
                          </h5>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={selectedKitId}
                          onChange={(e) => handleApplyKit(e.target.value)}
                          className="input-health !py-1 !px-2 text-xs w-auto min-w-[200px]"
                        >
                          <option value="">-- Apply Clinical Kit --</option>
                          {customKits.length > 0 && (
                            <optgroup label="⭐ My Custom Saved Kits">
                              {customKits.map((k) => (
                                <option key={k.id} value={k.id}>
                                  {k.name} ({k.medications.length} meds)
                                </option>
                              ))}
                            </optgroup>
                          )}
                          <optgroup label="🏥 Standard Protocols">
                            {BUILT_IN_CLINICAL_KITS.map((k) => (
                              <option key={k.id} value={k.id}>
                                {k.name} ({k.tag})
                              </option>
                            ))}
                          </optgroup>
                        </select>

                        <button
                          type="button"
                          onClick={() => setShowSaveKitModal(true)}
                          className="px-2.5 py-1 rounded-lg border border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-[11px] font-semibold flex items-center gap-1 shrink-0 transition-colors"
                          title="Save current medications as a reusable kit"
                        >
                          <BookmarkPlus className="w-3.5 h-3.5" />
                          <span>Save Kit</span>
                        </button>
                      </div>
                    </div>

                    {/* Quick chips for top kits with Edit button at right side */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-[10px]">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-slate-400 font-medium shrink-0">Quick Apply:</span>
                        {quickKitIds.map((id) => {
                          const k = allAvailableKits.find((kit) => kit.id === id);
                          if (!k) return null;
                          return (
                            <button
                              key={k.id}
                              type="button"
                              onClick={() => handleApplyKit(k.id)}
                              className={`px-2 py-0.5 rounded-md transition-colors font-medium flex items-center gap-1 ${
                                selectedKitId === k.id
                                  ? "bg-teal-600 text-white shadow-2xs"
                                  : "bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 hover:text-teal-600 dark:hover:bg-teal-950/60 dark:hover:text-teal-300 text-slate-600 dark:text-slate-300"
                              }`}
                              title={`${k.name} (${k.medications.length} medicines)`}
                            >
                              <span>⚡</span>
                              <span>{k.name.split("&")[0].split("(")[0].trim()}</span>
                            </button>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={handleOpenEditQuickTabs}
                        className="px-2.5 py-0.5 rounded-md text-teal-700 dark:text-teal-300 hover:bg-teal-100/80 dark:hover:bg-teal-900/60 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex items-center gap-1 font-bold text-[10px] shrink-0 ml-auto transition-colors shadow-2xs"
                        title="Edit and customize Quick Apply tabs"
                      >
                        <Pencil className="w-2.5 h-2.5 text-teal-600 dark:text-teal-400" />
                        <span>Edit</span>
                      </button>
                    </div>
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

                          {/* Auto Total Quantity Calculation Badge */}
                          <div className="sm:col-span-12 pt-2 mt-1 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between text-[11px]">
                            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                              <Package className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                              <span className="font-medium">Total Dispensing Quantity:</span>
                              <span className="font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-200 dark:border-teal-800/60">
                                {calculateTotalQuantity(med.frequency, med.duration).displayText}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 italic">
                              {calculateTotalQuantity(med.frequency, med.duration).isSOS
                                ? "On-demand symptom relief"
                                : "Auto calculated for pharmacy dispensing"}
                            </span>
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
                            <th className="py-2 px-3">Total Dispense</th>
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
                              <td className="py-2 px-3 text-[11px]">
                                <span className="inline-flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                                  <Package className="w-2.5 h-2.5 text-teal-600 dark:text-teal-400" />
                                  {calculateTotalQuantity(m.frequency, m.duration).displayText}
                                </span>
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

                <div className="flex items-center gap-2 flex-wrap">
                  {app.status === "confirmed" && (
                    app.recordAccessStatus === "granted" ? (
                      <button
                        type="button"
                        onClick={() => {
                          const rawId = app.patientUserId || (app as any).patientId || "";
                          const safeId = typeof rawId === "object" && rawId !== null ? (rawId as any)._id || String(rawId) : String(rawId);
                          setActivePatientForRecords({
                            patientUserId: safeId,
                            patientName: app.patientName,
                            patientEmail: app.patientEmail,
                            patientPhone: app.patientPhone,
                          });
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/40 border border-teal-200 dark:border-teal-800/80 flex items-center gap-1.5 transition-colors shadow-2xs"
                        title="Patient has granted consent. View health records, prescriptions & allergies"
                      >
                        <Activity className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                        <span>View Patient Records</span>
                      </button>
                    ) : app.recordAccessStatus === "requested" ? (
                      <span
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1.5 cursor-default"
                        title="Access request sent. Awaiting approval from patient."
                      >
                        <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                        <span>Access Requested (Pending)</span>
                      </span>
                    ) : app.recordAccessStatus === "denied" ? (
                      <div className="flex items-center gap-1.5">
                        <span
                          className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900"
                          title="Patient denied access to health records"
                        >
                          Access Denied
                        </span>
                        <button
                          type="button"
                          disabled={requestingRecordId === app._id}
                          onClick={() => handleRequestRecordAccess(app._id)}
                          className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 transition-colors"
                        >
                          {requestingRecordId === app._id ? "Sending..." : "Re-request"}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={requestingRecordId === app._id}
                        onClick={() => handleRequestRecordAccess(app._id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs"
                        title="Request patient permission to view their historical health records"
                      >
                        <Lock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                        <span>{requestingRecordId === app._id ? "Sending Request..." : "Request Records"}</span>
                      </button>
                    )
                  )}

                  {/* Doctor Option to Record or Update Patient Vitals */}
                  <button
                    type="button"
                    onClick={() => handleOpenVitalsModal(app)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900 border border-teal-200 dark:border-teal-800 flex items-center gap-1.5 transition-colors shadow-2xs"
                    title="Record or update patient vitals (BP, Height, Weight, Blood Sugar, DOB)"
                  >
                    <Activity className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>{app.patientVitals?.lastUpdated ? "Update Vitals" : "Record Vitals"}</span>
                  </button>

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

      {/* Save Custom Clinical Kit Modal */}
      {showSaveKitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookmarkPlus className="w-5 h-5 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Save as Custom Clinical Kit
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSaveKitModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Save the current set of{" "}
              <strong>{medications.filter((m) => m.medicineName.trim()).length}</strong> medicine(s)
              as a reusable 1-click template for future consultations.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Kit / Regimen Name *
                </label>
                <input
                  type="text"
                  value={newKitName}
                  onChange={(e) => setNewKitName(e.target.value)}
                  placeholder="e.g. Diarrhea & Dehydration Protocol"
                  className="input-health text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Category / Specialization Tag
                </label>
                <input
                  type="text"
                  value={newKitTag}
                  onChange={(e) => setNewKitTag(e.target.value)}
                  placeholder="e.g. Gastroenterology, General Practice, Pediatrics"
                  className="input-health text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowSaveKitModal(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCurrentAsKit}
                className="btn-primary !py-1.5 !px-4 !text-xs flex items-center gap-1"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                <span>Save Kit</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Quick Apply Tabs Modal */}
      {showEditQuickTabsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 max-w-lg w-full space-y-4 shadow-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                  <Settings2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Customize Quick Apply Tabs
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Select which clinical kits appear as 1-click shortcut tabs for fast prescribing
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditQuickTabsModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            {/* List of Kits to select */}
            <div className="overflow-y-auto space-y-2 pr-1 text-xs flex-1">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Available Clinical Kits</span>
                <span className="text-teal-600 dark:text-teal-400 font-semibold text-[11px]">
                  {tempQuickKitIds.length} Selected
                </span>
              </div>

              {allAvailableKits.map((kit) => {
                const isSelected = tempQuickKitIds.includes(kit.id);
                return (
                  <label
                    key={kit.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "border-teal-400 dark:border-teal-700 bg-teal-50/50 dark:bg-teal-950/40"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleQuickKit(kit.id)}
                      className="mt-0.5 rounded text-teal-600 focus:ring-teal-500 h-4 w-4 border-slate-300"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-xs">
                          {kit.name}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                          {kit.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                        {kit.description}
                      </p>
                      <div className="flex items-center gap-1.5 flex-wrap mt-1 text-[10px] text-slate-400">
                        <span className="font-semibold text-teal-600 dark:text-teal-400">
                          {kit.medications.length} medicines:
                        </span>
                        <span>
                          {kit.medications.map((m) => m.medicineName).join(", ")}
                        </span>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleResetQuickTabs}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1"
                title="Reset to standard default kits"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to Default</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditQuickTabsModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveQuickTabs}
                  className="btn-primary !py-1.5 !px-4 !text-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Tabs ({tempQuickKitIds.length})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Patient Health Records Modal */}
      {activePatientForRecords && (
        <PatientRecordsModal
          patientUserId={activePatientForRecords.patientUserId}
          patientName={activePatientForRecords.patientName}
          patientEmail={activePatientForRecords.patientEmail}
          patientPhone={activePatientForRecords.patientPhone}
          onClose={() => setActivePatientForRecords(null)}
        />
      )}

      {/* Doctor Update Patient Vitals Modal */}
      {selectedApptForVitals && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full space-y-4 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Update Patient Vitals
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Patient: <strong>{selectedApptForVitals.patientName}</strong> • {selectedApptForVitals.patientPhone || selectedApptForVitals.patientEmail}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApptForVitals(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            {/* Date of Last Update Banner */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                <span>Date of Last Update:</span>
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {selectedApptForVitals.patientVitals?.lastUpdated
                  ? new Date(selectedApptForVitals.patientVitals.lastUpdated).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Never recorded yet"}
              </span>
            </div>

            <form onSubmit={handleSaveDoctorVitals} className="space-y-4 overflow-y-auto pr-1">
              {/* Blood Pressure */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Blood Pressure (mmHg)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-slate-500">Systolic (Top #)</span>
                    <input
                      type="number"
                      placeholder="120"
                      value={doctorVitalsForm.systolic}
                      onChange={(e) => setDoctorVitalsForm({ ...doctorVitalsForm, systolic: e.target.value })}
                      className="input-health text-xs w-full mt-1"
                      required
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500">Diastolic (Bottom #)</span>
                    <input
                      type="number"
                      placeholder="80"
                      value={doctorVitalsForm.diastolic}
                      onChange={(e) => setDoctorVitalsForm({ ...doctorVitalsForm, diastolic: e.target.value })}
                      className="input-health text-xs w-full mt-1"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Height & Weight */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    placeholder="172"
                    value={doctorVitalsForm.heightCm}
                    onChange={(e) => setDoctorVitalsForm({ ...doctorVitalsForm, heightCm: e.target.value })}
                    className="input-health text-xs w-full mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="68"
                    value={doctorVitalsForm.weightKg}
                    onChange={(e) => setDoctorVitalsForm({ ...doctorVitalsForm, weightKg: e.target.value })}
                    className="input-health text-xs w-full mt-1"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Patient Date of Birth
                </label>
                <input
                  type="date"
                  value={doctorVitalsForm.dateOfBirth}
                  onChange={(e) => setDoctorVitalsForm({ ...doctorVitalsForm, dateOfBirth: e.target.value })}
                  className="input-health text-xs w-full mt-1"
                />
              </div>

              {/* Blood Sugar */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Blood Sugar (mg/dL)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-slate-500">Fasting (mg/dL)</span>
                    <input
                      type="number"
                      placeholder="94"
                      value={doctorVitalsForm.fastingSugar}
                      onChange={(e) => setDoctorVitalsForm({ ...doctorVitalsForm, fastingSugar: e.target.value })}
                      className="input-health text-xs w-full mt-1"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500">Post-Meal (mg/dL)</span>
                    <input
                      type="number"
                      placeholder="130"
                      value={doctorVitalsForm.postPrandialSugar}
                      onChange={(e) => setDoctorVitalsForm({ ...doctorVitalsForm, postPrandialSugar: e.target.value })}
                      className="input-health text-xs w-full mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Live Preview BMI calculation */}
              {doctorVitalsForm.heightCm && doctorVitalsForm.weightKg && (
                <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs text-teal-800 dark:text-teal-300 flex items-center justify-between">
                  <span className="font-medium">Calculated BMI:</span>
                  <span className="font-bold">
                    {(Number(doctorVitalsForm.weightKg) / Math.pow(Number(doctorVitalsForm.heightCm) / 100, 2)).toFixed(1)} kg/m²
                  </span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedApptForVitals(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingDoctorVitals}
                  className="btn-primary !py-2 !px-4 !text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingDoctorVitals ? "Saving..." : "Save Patient Vitals"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};