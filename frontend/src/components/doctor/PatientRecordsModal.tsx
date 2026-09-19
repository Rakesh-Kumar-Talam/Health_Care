import React, { useEffect, useState } from "react";
import { recordService } from "../../services/recordService";
import { HealthRecord, Patient, RecordCategory } from "../../types";
import { Badge } from "../common/Badge";
import {
  X,
  FileText,
  Search,
  Calendar,
  Building2,
  Stethoscope,
  AlertCircle,
  Activity,
  Download,
  Pill,
  ShieldCheck,
} from "lucide-react";

interface PatientRecordsModalProps {
  patientUserId: string;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  onClose: () => void;
}

export const PatientRecordsModal: React.FC<PatientRecordsModalProps> = ({
  patientUserId,
  patientName,
  patientEmail,
  patientPhone,
  onClose,
}) => {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [patientProfile, setPatientProfile] = useState<Patient | null>(null);
  const [counts, setCounts] = useState({
    total: 0,
    prescription: 0,
    scanning: 0,
    lab_report: 0,
    discharge_summary: 0,
    other: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState<number>(0);

  useEffect(() => {
    const fetchPatientRecords = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await recordService.getPatientRecords(patientUserId, {
          category: selectedCategory !== "all" ? selectedCategory : undefined,
          search: searchQuery.trim() || undefined,
        });
        if (res.success) {
          setRecords(res.records || []);
          if (res.counts) setCounts(res.counts);
          if (res.patientProfile) setPatientProfile(res.patientProfile);
        } else {
          setError("Could not retrieve patient records");
        }
      } catch (err: any) {
        console.error("Failed to load patient records:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load patient health records"
        );
      } finally {
        setLoading(false);
      }
    };

    if (patientUserId) {
      fetchPatientRecords();
    } else {
      setError("Patient profile ID not found for this appointment.");
      setLoading(false);
    }
  }, [patientUserId, selectedCategory, searchQuery, retryKey]);

  const getCategoryBadge = (cat: RecordCategory) => {
    switch (cat) {
      case "prescription":
        return <Badge variant="primary">Doctor Prescription</Badge>;
      case "lab_report":
        return <Badge variant="success">Lab Report</Badge>;
      case "scanning":
        return <Badge variant="warning">Diagnostic Scan</Badge>;
      case "discharge_summary":
        return <Badge variant="danger">Discharge Summary</Badge>;
      default:
        return <Badge variant="secondary">Medical Record</Badge>;
    }
  };

  const categories = [
    { id: "all", label: "All Records", count: counts.total },
    { id: "prescription", label: "Prescriptions", count: counts.prescription },
    { id: "lab_report", label: "Lab Reports", count: counts.lab_report },
    { id: "scanning", label: "Scans / Imaging", count: counts.scanning },
    { id: "discharge_summary", label: "Discharge Summaries", count: counts.discharge_summary },
    { id: "other", label: "Other", count: counts.other },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-4xl w-full h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="p-5 sm:p-6 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
                <Activity className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    {patientName}
                  </h2>
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800">
                    Patient Health Vault
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {patientEmail && <span>{patientEmail}</span>}
                  {patientPhone && (
                    <>
                      <span>•</span>
                      <span>{patientPhone}</span>
                    </>
                  )}
                  {patientProfile?.bloodGroup && (
                    <>
                      <span>•</span>
                      <span className="font-semibold text-rose-600 dark:text-rose-400">
                        Blood: {patientProfile.bloodGroup}
                      </span>
                    </>
                  )}
                  {patientProfile?.gender && patientProfile.gender !== "unspecified" && (
                    <>
                      <span>•</span>
                      <span className="capitalize">{patientProfile.gender}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Close records"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Allergy Warning Alert Banner */}
        {patientProfile?.allergies && patientProfile.allergies.length > 0 ? (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex items-start gap-3 text-xs">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-amber-900 dark:text-amber-200">
                Documented Patient Drug & Environmental Allergies:
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {patientProfile.allergies.map((allergy, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-bold text-[11px] border border-amber-300 dark:border-amber-700"
                  >
                    ⚠️ {allergy}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-6 mt-4 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>No specific drug allergies reported by patient.</span>
          </div>
        )}

        {/* Search & Categories Bar */}
        <div className="p-4 sm:p-6 pb-2 space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search diagnoses, medicines, hospitals..."
                className="input-health !py-1.5 !pl-9 text-xs w-full"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <span className="text-xs text-slate-400 self-end sm:self-auto font-medium">
              Showing {records.length} record(s)
            </span>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? "bg-teal-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    selectedCategory === cat.id
                      ? "bg-teal-700 text-white"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Records Content List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 pt-1 space-y-4">
          {error ? (
            <div className="text-center py-16 px-4 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center mx-auto text-rose-500 border border-rose-200 dark:border-rose-900">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                Unable to load health records
              </h4>
              <p className="text-xs text-rose-500 dark:text-rose-400 max-w-sm mx-auto">
                {error}
              </p>
              <button
                type="button"
                onClick={() => setRetryKey((k) => k + 1)}
                className="btn-primary !py-1.5 !px-4 !text-xs inline-flex"
              >
                Retry
              </button>
            </div>
          ) : loading ? (
            <div className="space-y-3">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 animate-pulse h-32"></div>
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 animate-pulse h-32"></div>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                No health records found
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {searchQuery
                  ? `No records matching "${searchQuery}". Try a different search term.`
                  : `No past medical records or prescriptions in the "${selectedCategory}" category.`}
              </p>
            </div>
          ) : (
            records.map((rec) => (
              <div
                key={rec._id}
                className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 hover:border-teal-400 dark:hover:border-teal-700 transition-all shadow-xs space-y-3"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {rec.title}
                    </span>
                    {getCategoryBadge(rec.category)}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-teal-600" />
                    <span>{rec.recordDate || "N/A"}</span>
                  </div>
                </div>

                {/* Doctor and Hospital info */}
                {(rec.doctorName || rec.hospitalName) && (
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    {rec.doctorName && (
                      <span className="flex items-center gap-1">
                        <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                        <span>Dr. {rec.doctorName}</span>
                      </span>
                    )}
                    {rec.hospitalName && (
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{rec.hospitalName}</span>
                      </span>
                    )}
                  </div>
                )}

                {/* Clinical Notes / Description */}
                {rec.description && (
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-mono bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                    {rec.description}
                  </p>
                )}

                {/* Prescribed Medications Table if available */}
                {rec.medications && rec.medications.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                      <Pill className="w-3.5 h-3.5 text-teal-600" />
                      <span>Prescribed Medication Regimen ({rec.medications.length} items)</span>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/40">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
                            <th className="py-2 px-3">#</th>
                            <th className="py-2 px-3">Medicine Name</th>
                            <th className="py-2 px-3">Frequency</th>
                            <th className="py-2 px-3">Duration</th>
                            <th className="py-2 px-3">Instructions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {rec.medications.map((m, mIdx) => (
                            <tr key={mIdx}>
                              <td className="py-2 px-3 text-slate-400 font-semibold">{mIdx + 1}</td>
                              <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">
                                {m.medicineName}
                              </td>
                              <td className="py-2 px-3 text-emerald-700 dark:text-emerald-400 font-medium">
                                {m.frequency}
                              </td>
                              <td className="py-2 px-3 text-sky-700 dark:text-sky-400 font-medium">
                                {m.duration}
                              </td>
                              <td className="py-2 px-3 text-amber-700 dark:text-amber-400">
                                {m.instructions}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Footer with tags & file attachments */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {rec.tags &&
                      rec.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px]"
                        >
                          #{tag}
                        </span>
                      ))}
                  </div>

                  {rec.fileUrl && (
                    <a
                      href={rec.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 text-xs font-semibold flex items-center gap-1.5 border border-teal-200 dark:border-teal-800 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{rec.fileName || "View Attachment"}</span>
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Bottom Close */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Encrypted Health Record Access</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
