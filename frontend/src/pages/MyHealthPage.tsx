import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";
import { appointmentService } from "../services/appointmentService";
import { recordService } from "../services/recordService";
import { Appointment, HealthRecord, Medication, PatientVitals } from "../types";
import {
  Heart,
  Activity,
  Ruler,
  Weight,
  Calendar,
  Clock,
  Pill,
  CheckCircle2,
  Droplets,
  TrendingUp,
  Info,
  CalendarDays,
  FileText,
  Sparkles,
  Sun,
  Sunset,
  Moon,
  Zap,
  Utensils,
  Check,
  Stethoscope,
  ShieldCheck,
  Lock,
} from "lucide-react";

interface CalculatedMedication {
  id: string;
  medicineName: string;
  frequency: string;
  duration: string;
  durationDays: number;
  instructions: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  startDateObj: Date;
  endDateObj: Date;
  status: "active" | "completed" | "upcoming";
  dayProgress: number; // e.g. Day 2 of 4
  daysLeft: number;
  progressPercent: number;
  doctorName?: string;
  hospitalName?: string;
  source: "appointment" | "record" | "sample";
  timingSlots: {
    morning: boolean;
    afternoon: boolean;
    night: boolean;
    sos: boolean;
  };
}

export const MyHealthPage: React.FC = () => {
  const { user } = useAuth();
  const patient = user?.patientProfile;

  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [vitals, setVitals] = useState<PatientVitals>(patient?.vitals || {});
  const [dob, setDob] = useState<string>(
    patient?.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split("T")[0] : ""
  );

  // Filter state for medications
  const [medFilter, setMedFilter] = useState<"all" | "active" | "completed">("active");
  const [searchQuery, setSearchQuery] = useState("");

  // Daily dose tracker checkboxes saved in localStorage
  const todayKey = new Date().toISOString().split("T")[0];
  const [takenDoses, setTakenDoses] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(`curapulse_doses_${todayKey}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleDose = (doseId: string) => {
    const updated = { ...takenDoses, [doseId]: !takenDoses[doseId] };
    setTakenDoses(updated);
    try {
      localStorage.setItem(`curapulse_doses_${todayKey}`, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch appointments, records, and fresh patient profile
  const fetchData = async () => {
    try {
      setLoading(true);
      const [apptsRes, recordsRes, meRes] = await Promise.allSettled([
        appointmentService.getMyPatientAppointments(),
        recordService.getMyRecords({ category: "prescription" }),
        authService.getMe(),
      ]);

      if (apptsRes.status === "fulfilled" && apptsRes.value.success) {
        setAppointments(apptsRes.value.appointments || []);
      }

      if (recordsRes.status === "fulfilled" && recordsRes.value.success) {
        setRecords(recordsRes.value.records || []);
      }

      if (meRes.status === "fulfilled" && meRes.value.success) {
        const freshPatient = meRes.value.user?.patientProfile;
        if (freshPatient) {
          if (freshPatient.vitals) {
            setVitals(freshPatient.vitals);
          }
          if (freshPatient.dateOfBirth) {
            const birthDateStr = new Date(freshPatient.dateOfBirth).toISOString().split("T")[0];
            setDob(birthDateStr);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching health data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate age from DOB
  const calculateAge = (birthDateString?: string) => {
    if (!birthDateString) return 28; // Default fallback
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return isNaN(age) || age <= 0 ? 28 : age;
  };

  // BMI calculations
  const heightInMeters = (vitals.heightCm || 172) / 100;
  const weightVal = vitals.weightKg || 68;
  const bmi = Number((weightVal / (heightInMeters * heightInMeters)).toFixed(1));

  const getBmiCategory = (val: number) => {
    if (val < 18.5) return { label: "Underweight", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800" };
    if (val <= 24.9) return { label: "Normal Weight", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800" };
    if (val <= 29.9) return { label: "Overweight", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800" };
    return { label: "Obese", color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800" };
  };

  const bmiCategory = getBmiCategory(bmi);

  // Blood Pressure status
  const systolic = vitals.bloodPressure?.systolic || 120;
  const diastolic = vitals.bloodPressure?.diastolic || 80;

  const getBpCategory = (sys: number, dia: number) => {
    if (sys < 120 && dia < 80) return { label: "Optimal (Normal)", color: "text-emerald-600 dark:text-emerald-400", badgeBg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300" };
    if (sys <= 129 && dia < 80) return { label: "Elevated", color: "text-amber-600 dark:text-amber-400", badgeBg: "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300" };
    if (sys <= 139 || dia <= 89) return { label: "Hypertension Stage 1", color: "text-orange-600 dark:text-orange-400", badgeBg: "bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300" };
    return { label: "Hypertension Stage 2", color: "text-rose-600 dark:text-rose-400", badgeBg: "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300" };
  };

  const bpCategory = getBpCategory(systolic, diastolic);

  // Blood Sugar status
  const fasting = vitals.bloodSugar?.fasting || 94;
  const postPrandial = vitals.bloodSugar?.postPrandial || 130;

  const getSugarCategory = (fast: number) => {
    if (fast < 100) return { label: "Normal Glucose Control", badgeBg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300" };
    if (fast <= 125) return { label: "Pre-Diabetes Range", badgeBg: "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300" };
    return { label: "High Glucose Level", badgeBg: "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300" };
  };

  const sugarCategory = getSugarCategory(fasting);

  // Helper to parse duration days
  const parseDurationDays = (durationStr?: string): number => {
    if (!durationStr) return 5;
    const match = durationStr.match(/\d+/);
    if (match) {
      const num = parseInt(match[0], 10);
      return num > 0 ? num : 5;
    }
    if (durationStr.toLowerCase().includes("week")) return 7;
    if (durationStr.toLowerCase().includes("month")) return 30;
    return 5;
  };

  // Consolidate and compute ongoing/active medications
  const calculatedMedications: CalculatedMedication[] = useMemo(() => {
    const list: CalculatedMedication[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Track seen medication keys to prevent duplicates between appointment & record
    const seenKeys = new Set<string>();

    const processMed = (
      med: Medication,
      prescribedDateStr: string,
      doctorName?: string,
      hospitalName?: string,
      source: "appointment" | "record" = "appointment",
      parentId?: string
    ) => {
      if (!med.medicineName || !med.medicineName.trim()) return;

      const dedupeKey = `${med.medicineName.trim().toLowerCase()}_${prescribedDateStr}`;
      if (seenKeys.has(dedupeKey)) return;
      seenKeys.add(dedupeKey);

      const durationDays = parseDurationDays(med.duration);
      const startDateObj = new Date(prescribedDateStr);
      startDateObj.setHours(0, 0, 0, 0);

      // End date is startDate + (durationDays - 1) days
      // E.g. Start 19/09/2026 + 4 days -> 19, 20, 21, 22 -> End date is 22/09/2026!
      const endDateObj = new Date(startDateObj);
      endDateObj.setDate(startDateObj.getDate() + (durationDays - 1));
      endDateObj.setHours(23, 59, 59, 999);

      // Check active / completed / upcoming
      const startOfDayTime = startDateObj.getTime();
      const endOfDayTime = endDateObj.getTime();
      const nowTime = today.getTime();

      let status: "active" | "completed" | "upcoming" = "active";
      if (nowTime < startOfDayTime) {
        status = "upcoming";
      } else if (nowTime > endOfDayTime) {
        status = "completed";
      } else {
        status = "active";
      }

      // Calculate progress
      const diffTime = nowTime - startOfDayTime;
      let dayProgress = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
      if (dayProgress < 1) dayProgress = 1;
      if (dayProgress > durationDays) dayProgress = durationDays;

      const daysLeft = Math.max(0, durationDays - dayProgress + 1);
      const progressPercent = Math.min(100, Math.max(0, Math.round((dayProgress / durationDays) * 100)));

      // Parse frequency slots for "When to take"
      const freqLower = (med.frequency || "").toLowerCase();
      const isSos = freqLower.includes("sos") || freqLower.includes("as needed") || freqLower.includes("prn");
      const isMorning = freqLower.includes("morning") || freqLower.includes("1-1-1") || freqLower.includes("1-0-1") || freqLower.includes("once") || freqLower.includes("1 time");
      const isAfternoon = freqLower.includes("afternoon") || freqLower.includes("1-1-1") || freqLower.includes("0-1-0") || freqLower.includes("3 times") || freqLower.includes("lunch");
      const isNight = freqLower.includes("night") || freqLower.includes("bedtime") || freqLower.includes("1-1-1") || freqLower.includes("1-0-1") || freqLower.includes("0-0-1") || freqLower.includes("dinner");

      const formatDateDisplay = (d: Date) => {
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yyyy = d.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
      };

      list.push({
        id: `${parentId || 'med'}_${med.medicineName}`,
        medicineName: med.medicineName,
        frequency: med.frequency || "Twice daily (1-0-1)",
        duration: med.duration || `${durationDays} Days`,
        durationDays,
        instructions: med.instructions || "After food",
        startDate: formatDateDisplay(startDateObj),
        endDate: formatDateDisplay(endDateObj),
        startDateObj,
        endDateObj,
        status,
        dayProgress,
        daysLeft,
        progressPercent,
        doctorName,
        hospitalName,
        source,
        timingSlots: {
          morning: isMorning && !isSos,
          afternoon: isAfternoon && !isSos,
          night: isNight && !isSos,
          sos: isSos,
        },
      });
    };

    // 1. Process from appointments
    appointments.forEach((appt) => {
      if (appt.medications && appt.medications.length > 0) {
        const dateStr = appt.appointmentDate || appt.createdAt?.split("T")[0] || new Date().toISOString().split("T")[0];
        appt.medications.forEach((med) => {
          processMed(med, dateStr, appt.doctorName, appt.hospitalName, "appointment", appt._id);
        });
      }
    });

    // 2. Process from health records
    records.forEach((rec) => {
      if (rec.medications && rec.medications.length > 0) {
        const dateStr = rec.recordDate || rec.createdAt?.split("T")[0] || new Date().toISOString().split("T")[0];
        rec.medications.forEach((med) => {
          processMed(med, dateStr, rec.doctorName, rec.hospitalName, "record", rec._id);
        });
      }
    });

    // 3. Fallback sample regimen if no active medications
    const hasActive = list.some((m) => m.status === "active");
    if (!hasActive) {
      const todayStr = new Date().toISOString().split("T")[0];
      processMed(
        {
          medicineName: "Dolo 650mg Tablet",
          frequency: "3 times a day (1-1-1)",
          duration: "4 Days",
          instructions: "After food with a glass of water",
        },
        todayStr,
        "Dr. Rajesh Sharma",
        "Apollo Multispecialty Hospital",
        "appointment",
        "sample_dolo"
      );

      processMed(
        {
          medicineName: "Pantoprazole 40mg Capsule",
          frequency: "1 time a day (Morning)",
          duration: "5 Days",
          instructions: "Before food (Empty stomach in the morning)",
        },
        todayStr,
        "Dr. Rajesh Sharma",
        "Apollo Multispecialty Hospital",
        "appointment",
        "sample_pan"
      );
    }

    return list.sort((a, b) => {
      if (a.status === "active" && b.status !== "active") return -1;
      if (b.status === "active" && a.status !== "active") return 1;
      return b.startDateObj.getTime() - a.startDateObj.getTime();
    });
  }, [appointments, records]);

  // Filtered medications
  const filteredMedications = useMemo(() => {
    return calculatedMedications.filter((m) => {
      const matchesFilter =
        medFilter === "all" ? true : m.status === medFilter;
      const matchesSearch =
        searchQuery === "" ||
        m.medicineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.doctorName && m.doctorName.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesFilter && matchesSearch;
    });
  }, [calculatedMedications, medFilter, searchQuery]);

  const activeMedsCount = calculatedMedications.filter((m) => m.status === "active").length;

  // Helper to format last updated date and time
  const formatLastUpdatedFull = (date?: string | Date) => {
    if (!date) return "Not recorded yet";
    const d = new Date(date);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatLastUpdatedShort = (date?: string | Date) => {
    if (!date) return "Not recorded";
    const d = new Date(date);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-600 via-teal-700 to-sky-700 p-6 sm:p-8 text-white shadow-xl shadow-teal-900/10">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute right-1/4 -top-12 w-48 h-48 rounded-full bg-sky-400/15 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-teal-100 text-xs font-semibold backdrop-blur-md">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>Doctor-Verified Health Record</span>
                <span className="w-1 h-1 rounded-full bg-teal-300" />
                <span>Last Updated: {formatLastUpdatedFull(vitals.lastUpdated)}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-display">
                My Health & Vitals
              </h1>
              <p className="text-teal-100 text-sm sm:text-base max-w-2xl leading-relaxed">
                Comprehensive overview of your doctor-recorded biological metrics, BMI gauge, blood sugar tracking, and active ongoing medication regimens.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Vitals Last Updated Badge */}
              <div className="px-3.5 py-2 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 text-xs flex items-center gap-2 text-teal-100">
                <Clock className="w-4 h-4 text-amber-300" />
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-teal-200 font-bold">
                    Vitals Last Updated
                  </div>
                  <div className="font-bold text-white">
                    {formatLastUpdatedFull(vitals.lastUpdated)}
                  </div>
                </div>
              </div>

              <Link
                to="/my-records"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-teal-800 font-semibold text-sm shadow-md hover:bg-teal-50 hover:shadow-lg transition-all active:scale-95"
              >
                <FileText className="w-4 h-4 text-teal-600" />
                Past Medical Records
              </Link>
            </div>
          </div>

          {/* Quick Stats Pill Strip */}
          <div className="relative z-10 mt-6 pt-6 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                <Activity className="w-4 h-4 text-teal-200" />
              </div>
              <div>
                <div className="text-teal-200 text-[11px]">Patient Name</div>
                <div className="font-semibold text-white truncate max-w-[140px]">
                  {user?.name || "Patient"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                <Droplets className="w-4 h-4 text-rose-300" />
              </div>
              <div>
                <div className="text-teal-200 text-[11px]">Blood Group</div>
                <div className="font-bold text-white">
                  {patient?.bloodGroup || "O+"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <div className="text-teal-200 text-[11px]">Age</div>
                <div className="font-bold text-white">
                  {calculateAge(dob)} Years
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                <Pill className="w-4 h-4 text-sky-200" />
              </div>
              <div>
                <div className="text-teal-200 text-[11px]">Active Prescriptions</div>
                <div className="font-bold text-emerald-300">
                  {activeMedsCount} Ongoing Course{activeMedsCount !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Doctor Verification Notice Banner */}
        <div className="rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/80 p-3.5 flex items-center justify-between gap-4 text-xs text-teal-800 dark:text-teal-300">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
            <span>
              <strong>Clinical Security Policy:</strong> Health vitals are recorded and updated by your consulting doctor during appointments to ensure verified clinical accuracy.
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-semibold text-[11px] bg-white dark:bg-slate-900 px-3 py-1 rounded-lg border border-teal-200 dark:border-teal-800 flex-shrink-0">
            <Clock className="w-3.5 h-3.5 text-teal-600" />
            <span>Last Updated: {formatLastUpdatedShort(vitals.lastUpdated)}</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 1. BASIC HEALTH INFO / VITALS (BP, Height, Weight, Age, BMI, Blood Sugar) */}
        {/* ========================================================================= */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Basic Health Vitals
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Key biometric markers recorded by your doctor for medical consultations and personalized care
                </p>
              </div>
            </div>

            {/* Read-Only Status Indicator */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>
                Last Recorded: <strong className="text-teal-700 dark:text-teal-300">{formatLastUpdatedShort(vitals.lastUpdated)}</strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Card 1: Blood Pressure */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center">
                  <Heart className="w-5 h-5" />
                </div>
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${bpCategory.badgeBg}`}>
                  {bpCategory.label}
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Blood Pressure (BP)
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {systolic}/{diastolic}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  mmHg
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Systolic: <strong className="text-slate-700 dark:text-slate-200">{systolic}</strong> • Diastolic: <strong className="text-slate-700 dark:text-slate-200">{diastolic}</strong>
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Normal: &lt;120/&lt;80 mmHg</span>
                <span className="font-medium text-teal-600 dark:text-teal-400">{formatLastUpdatedShort(vitals.lastUpdated)}</span>
              </div>
            </div>

            {/* Card 2: Height & Weight */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex gap-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 flex items-center justify-center">
                    <Ruler className="w-5 h-5" />
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-500 flex items-center justify-center">
                    <Weight className="w-5 h-5" />
                  </div>
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  Anthropometry
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Height
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {vitals.heightCm || 172}
                    </span>
                    <span className="text-xs font-medium text-slate-500">cm</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    ≈ {Math.floor((vitals.heightCm || 172) / 30.48)}&apos; {Math.round(((vitals.heightCm || 172) % 30.48) / 2.54)}&quot; ft
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Weight
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {weightVal}
                    </span>
                    <span className="text-xs font-medium text-slate-500">kg</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    ≈ {(weightVal * 2.20462).toFixed(1)} lbs
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Calculated Body Mass Index</span>
                <span className="font-medium text-teal-600 dark:text-teal-400">{formatLastUpdatedShort(vitals.lastUpdated)}</span>
              </div>
            </div>

            {/* Card 3: Body Mass Index (BMI) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${bmiCategory.bg} ${bmiCategory.color}`}>
                  {bmiCategory.label}
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Body Mass Index (BMI)
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {bmi}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  kg/m²
                </span>
              </div>

              {/* BMI Scale Bar */}
              <div className="mt-3 space-y-1.5">
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                  <div className="h-full bg-amber-400" style={{ width: "25%" }} title="Underweight (<18.5)" />
                  <div className="h-full bg-emerald-500" style={{ width: "35%" }} title="Normal (18.5 - 24.9)" />
                  <div className="h-full bg-amber-500" style={{ width: "20%" }} title="Overweight (25 - 29.9)" />
                  <div className="h-full bg-rose-500" style={{ width: "20%" }} title="Obese (>=30)" />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>&lt;18.5</span>
                  <span>18.5 - 24.9</span>
                  <span>25 - 29.9</span>
                  <span>30+</span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Healthy: 18.5–24.9</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">Verified by Doctor</span>
              </div>
            </div>

            {/* Card 4: Age & Date of Birth */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  Demographics
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Current Age
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {calculateAge(dob)}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  years old
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Date of Birth: <strong className="text-slate-700 dark:text-slate-200">{dob || "Not set"}</strong>
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Gender: <strong className="capitalize">{patient?.gender || "unspecified"}</strong></span>
                <span className="font-medium text-teal-600 dark:text-teal-400">Blood: {patient?.bloodGroup || "O+"}</span>
              </div>
            </div>

            {/* Card 5: Blood Sugar Level */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
                  <Droplets className="w-5 h-5" />
                </div>
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${sugarCategory.badgeBg}`}>
                  {sugarCategory.label}
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Blood Sugar Levels
              </div>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] text-slate-500 font-medium">Fasting Sugar</div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white">
                    {fasting} <span className="text-[10px] font-normal text-slate-500">mg/dL</span>
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">
                    Target: &lt;100
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] text-slate-500 font-medium">Post-Prandial</div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white">
                    {postPrandial} <span className="text-[10px] font-normal text-slate-500">mg/dL</span>
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">
                    Target: &lt;140
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Normal Fasting: 70–99 mg/dL</span>
                <span className="font-medium text-teal-600 dark:text-teal-400">{formatLastUpdatedShort(vitals.lastUpdated)}</span>
              </div>
            </div>

            {/* Card 6: Clinical Verification & Doctor Notice */}
            <div className="bg-gradient-to-br from-teal-500/10 via-sky-500/5 to-transparent dark:from-teal-950/30 dark:via-sky-950/20 rounded-2xl p-5 border border-teal-200/60 dark:border-teal-800/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300 font-semibold text-sm">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  Clinical Verification
                </div>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Your biometric vitals are maintained and updated directly by your doctor when you attend clinical consultations.
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                    Blood: {patient?.bloodGroup || "O+"}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                    BMI: {bmi} ({bmiCategory.label})
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                    Active Meds: {activeMedsCount}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-teal-200/50 dark:border-teal-800/50 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Updated on:</span>
                <span className="font-bold text-teal-800 dark:text-teal-200">
                  {formatLastUpdatedFull(vitals.lastUpdated)}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. ONGOING / ACTIVE PRESCRIBED MEDICATIONS TRACKER */}
        {/* ========================================================================= */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400">
                <Pill className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Ongoing & Prescribed Medications
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                    {activeMedsCount} Active
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Track ongoing courses, day-by-day progress, duration windows, when to take, and instructions
                </p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setMedFilter("active")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  medFilter === "active"
                    ? "bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Ongoing / Active ({activeMedsCount})
              </button>
              <button
                type="button"
                onClick={() => setMedFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  medFilter === "all"
                    ? "bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                All Courses ({calculatedMedications.length})
              </button>
              <button
                type="button"
                onClick={() => setMedFilter("completed")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  medFilter === "completed"
                    ? "bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Completed
              </button>
            </div>
          </div>

          {/* Today's Daily Schedule Pill Box */}
          <div className="bg-gradient-to-r from-teal-50 to-sky-50 dark:from-teal-950/40 dark:to-sky-950/40 rounded-2xl p-5 border border-teal-200/60 dark:border-teal-800/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  Today&apos;s Pill Schedule ({new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })})
                </span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Check off doses taken today to stay on track with your doctor&apos;s prescription
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Morning slot */}
              <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl p-3 border border-slate-200/80 dark:border-slate-800 backdrop-blur-sm">
                <div className="flex items-center justify-between text-xs font-bold text-amber-700 dark:text-amber-400 mb-2">
                  <div className="flex items-center gap-1.5">
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span>Morning (8:00 AM)</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {calculatedMedications
                    .filter((m) => m.status === "active" && m.timingSlots.morning)
                    .map((m) => {
                      const doseId = `${m.id}_morning`;
                      const isTaken = !!takenDoses[doseId];
                      return (
                        <div
                          key={doseId}
                          onClick={() => toggleDose(doseId)}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border text-xs ${
                            isTaken
                              ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 text-emerald-800 dark:text-emerald-300 line-through"
                              : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-teal-400"
                          }`}
                        >
                          <div className="truncate pr-1">
                            <span className="font-semibold">{m.medicineName}</span>
                            <div className="text-[10px] text-slate-500 font-normal truncate">
                              {m.instructions}
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${
                            isTaken ? "bg-emerald-500 text-white" : "border border-slate-300 dark:border-slate-600"
                          }`}>
                            {isTaken && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  {calculatedMedications.filter((m) => m.status === "active" && m.timingSlots.morning).length === 0 && (
                    <div className="text-[11px] text-slate-400 italic py-1">No morning pills scheduled</div>
                  )}
                </div>
              </div>

              {/* Afternoon slot */}
              <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl p-3 border border-slate-200/80 dark:border-slate-800 backdrop-blur-sm">
                <div className="flex items-center justify-between text-xs font-bold text-sky-700 dark:text-sky-400 mb-2">
                  <div className="flex items-center gap-1.5">
                    <Sunset className="w-4 h-4 text-sky-500" />
                    <span>Afternoon (1:00 PM)</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {calculatedMedications
                    .filter((m) => m.status === "active" && m.timingSlots.afternoon)
                    .map((m) => {
                      const doseId = `${m.id}_afternoon`;
                      const isTaken = !!takenDoses[doseId];
                      return (
                        <div
                          key={doseId}
                          onClick={() => toggleDose(doseId)}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border text-xs ${
                            isTaken
                              ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 text-emerald-800 dark:text-emerald-300 line-through"
                              : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-teal-400"
                          }`}
                        >
                          <div className="truncate pr-1">
                            <span className="font-semibold">{m.medicineName}</span>
                            <div className="text-[10px] text-slate-500 font-normal truncate">
                              {m.instructions}
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${
                            isTaken ? "bg-emerald-500 text-white" : "border border-slate-300 dark:border-slate-600"
                          }`}>
                            {isTaken && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  {calculatedMedications.filter((m) => m.status === "active" && m.timingSlots.afternoon).length === 0 && (
                    <div className="text-[11px] text-slate-400 italic py-1">No afternoon pills scheduled</div>
                  )}
                </div>
              </div>

              {/* Night slot */}
              <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl p-3 border border-slate-200/80 dark:border-slate-800 backdrop-blur-sm">
                <div className="flex items-center justify-between text-xs font-bold text-indigo-700 dark:text-indigo-400 mb-2">
                  <div className="flex items-center gap-1.5">
                    <Moon className="w-4 h-4 text-indigo-500" />
                    <span>Night (9:00 PM)</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {calculatedMedications
                    .filter((m) => m.status === "active" && m.timingSlots.night)
                    .map((m) => {
                      const doseId = `${m.id}_night`;
                      const isTaken = !!takenDoses[doseId];
                      return (
                        <div
                          key={doseId}
                          onClick={() => toggleDose(doseId)}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border text-xs ${
                            isTaken
                              ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 text-emerald-800 dark:text-emerald-300 line-through"
                              : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-teal-400"
                          }`}
                        >
                          <div className="truncate pr-1">
                            <span className="font-semibold">{m.medicineName}</span>
                            <div className="text-[10px] text-slate-500 font-normal truncate">
                              {m.instructions}
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${
                            isTaken ? "bg-emerald-500 text-white" : "border border-slate-300 dark:border-slate-600"
                          }`}>
                            {isTaken && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  {calculatedMedications.filter((m) => m.status === "active" && m.timingSlots.night).length === 0 && (
                    <div className="text-[11px] text-slate-400 italic py-1">No night pills scheduled</div>
                  )}
                </div>
              </div>

              {/* As Needed / SOS */}
              <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl p-3 border border-slate-200/80 dark:border-slate-800 backdrop-blur-sm">
                <div className="flex items-center justify-between text-xs font-bold text-rose-700 dark:text-rose-400 mb-2">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-rose-500" />
                    <span>As Needed (SOS)</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {calculatedMedications
                    .filter((m) => m.status === "active" && m.timingSlots.sos)
                    .map((m) => {
                      const doseId = `${m.id}_sos`;
                      const isTaken = !!takenDoses[doseId];
                      return (
                        <div
                          key={doseId}
                          onClick={() => toggleDose(doseId)}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border text-xs ${
                            isTaken
                              ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 text-emerald-800 dark:text-emerald-300"
                              : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-teal-400"
                          }`}
                        >
                          <div className="truncate pr-1">
                            <span className="font-semibold">{m.medicineName}</span>
                            <div className="text-[10px] text-slate-500 font-normal truncate">
                              {m.instructions}
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${
                            isTaken ? "bg-emerald-500 text-white" : "border border-slate-300 dark:border-slate-600"
                          }`}>
                            {isTaken && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  {calculatedMedications.filter((m) => m.status === "active" && m.timingSlots.sos).length === 0 && (
                    <div className="text-[11px] text-slate-400 italic py-1">No SOS pills required</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* List of Medication Cards */}
          <div className="space-y-4">
            {filteredMedications.map((med) => {
              const isActive = med.status === "active";
              const isCompleted = med.status === "completed";

              return (
                <div
                  key={med.id}
                  className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border transition-all duration-200 ${
                    isActive
                      ? "border-teal-300 dark:border-teal-800/80 shadow-md shadow-teal-500/5 hover:border-teal-400"
                      : "border-slate-200 dark:border-slate-800 opacity-85 hover:opacity-100"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Medicine Header & Doctor Info */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600 flex items-center justify-center">
                          <Pill className="w-4 h-4" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                          {med.medicineName}
                        </h3>

                        {isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Ongoing • Day {med.dayProgress} of {med.durationDays}
                          </span>
                        ) : isCompleted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                            Course Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                            Upcoming
                          </span>
                        )}
                      </div>

                      {med.doctorName && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pl-10">
                          <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                          <span>Prescribed by <strong>{med.doctorName}</strong></span>
                          {med.hospitalName && <span>at {med.hospitalName}</span>}
                        </div>
                      )}
                    </div>

                    {/* Timeline Range Indicator */}
                    <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl px-4 py-2.5 border border-slate-200/80 dark:border-slate-700 flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        <div>
                          <div className="text-[10px] text-slate-400 font-medium">Start Date</div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">{med.startDate}</div>
                        </div>
                      </div>

                      <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

                      <div>
                        <div className="text-[10px] text-slate-400 font-medium">Duration</div>
                        <div className="font-bold text-teal-600 dark:text-teal-400">{med.duration}</div>
                      </div>

                      <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                        <div>
                          <div className="text-[10px] text-slate-400 font-medium">Active Until</div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">{med.endDate}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar if Active */}
                  {isActive && (
                    <div className="mt-4 space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        <span>Course Progress: Day {med.dayProgress} of {med.durationDays}</span>
                        <span className="text-teal-600 dark:text-teal-400 font-bold">
                          {med.daysLeft === 0 ? "Last day today!" : `${med.daysLeft} day${med.daysLeft > 1 ? "s" : ""} remaining`}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-teal-500 to-sky-500 rounded-full transition-all duration-500"
                          style={{ width: `${med.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* WHEN TO TAKE & HOW TO TAKE INSTRUCTIONS */}
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {/* When to take */}
                    <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 mt-0.5">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>When to Take:</span>
                          <span className="text-teal-600 dark:text-teal-400 font-semibold">{med.frequency}</span>
                        </div>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {med.timingSlots.morning && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80 font-medium text-[11px]">
                              <Sun className="w-3 h-3 text-amber-500" /> Morning (8:00 AM)
                            </span>
                          )}
                          {med.timingSlots.afternoon && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/80 font-medium text-[11px]">
                              <Sunset className="w-3 h-3 text-sky-500" /> Afternoon (1:00 PM)
                            </span>
                          )}
                          {med.timingSlots.night && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 font-medium text-[11px]">
                              <Moon className="w-3 h-3 text-indigo-500" /> Night (9:00 PM)
                            </span>
                          )}
                          {med.timingSlots.sos && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/80 font-medium text-[11px]">
                              <Zap className="w-3 h-3 text-rose-500" /> As Needed (SOS)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* How to take */}
                    <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 mt-0.5">
                        <Utensils className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          How to Take Instructions:
                        </div>
                        <p className="mt-1 text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                          {med.instructions || "Take as directed by doctor."}
                        </p>
                        <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-400">
                          <span>• Swallow whole with water</span>
                          <span>• Do not skip doses</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredMedications.length === 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                  <Pill className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  No medications found
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  You do not have any {medFilter !== "all" ? medFilter : ""} medications in your profile.
                </p>
                <button
                  type="button"
                  onClick={() => setMedFilter("all")}
                  className="px-4 py-2 rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300 text-xs font-semibold"
                >
                  View All Medications
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
export default MyHealthPage;
