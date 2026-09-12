import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { recordService, CreateRecordPayload } from "../services/recordService";
import { HealthRecord, RecordCategory, Medication } from "../types";
import { Badge } from "../components/common/Badge";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  Trash2,
  Calendar,
  Stethoscope,
  Building2,
  Sparkles,
  ShieldCheck,
  Eye,
  CheckCircle2,
  X,
  UploadCloud,
  FileCheck,
  Activity,
  Microscope,
  Paperclip,
  Tag,
  AlertCircle,
  Clock,
  ArrowRight,
  Pill,
  Utensils,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

export const MyRecordsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";

  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [counts, setCounts] = useState({
    total: 0,
    prescription: 0,
    scanning: 0,
    lab_report: 0,
    discharge_summary: 0,
    other: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOption, setSortOption] = useState<"newest" | "oldest">("newest");

  // Modal states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [viewingRecord, setViewingRecord] = useState<HealthRecord | null>(null);

  // Upload Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<RecordCategory>("prescription");
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split("T")[0]);
  const [doctorName, setDoctorName] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [description, setDescription] = useState("");
  const [medications, setMedications] = useState<Medication[]>([
    {
      medicineName: "",
      frequency: "2 times a day (1-0-1)",
      duration: "5 Days",
      instructions: "After food",
    },
  ]);
  const [tags, setTags] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await recordService.getMyRecords({
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        search: searchQuery.trim() || undefined,
        sort: sortOption,
      });
      if (res.success) {
        setRecords(res.records);
        if (res.counts) setCounts(res.counts);
      }
    } catch (err) {
      console.error("Failed to load records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [selectedCategory, sortOption]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecords();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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

  const parseMedicationsFromRecord = (rec: HealthRecord): Medication[] => {
    if (rec.medications && rec.medications.length > 0) {
      return rec.medications;
    }

    if (!rec.description || !rec.description.trim()) {
      return [
        {
          medicineName: "Prescribed Clinical Medication",
          frequency: "2 times a day (1-0-1)",
          duration: "5 Days",
          instructions: "Take as directed by doctor",
        },
      ];
    }

    const lines = rec.description
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const parsed: Medication[] = [];

    for (const line of lines) {
      const cleanLine = line.replace(/^(\d+[\.\)]|\-|\•)\s*/, "").trim();
      if (!cleanLine) continue;

      const isAdviceOnly =
        /^(drink|follow up|rest|avoid|diet|consult|hydrate|lifestyle|exercise|note)/i.test(
          cleanLine
        ) &&
        !cleanLine.toLowerCase().includes("mg") &&
        !cleanLine.toLowerCase().includes("tablet") &&
        !cleanLine.toLowerCase().includes("capsule");

      if (isAdviceOnly && parsed.length > 0) {
        continue;
      }

      if (
        cleanLine.includes("-") ||
        cleanLine.toLowerCase().includes("for") ||
        cleanLine.toLowerCase().includes("days") ||
        cleanLine.toLowerCase().includes("mg")
      ) {
        const parts = cleanLine.split(/ - | \- /);
        const name = parts[0] || cleanLine;
        let freq = "2 times a day (1-0-1)";
        let dur = "5 Days";
        let inst = "After food";

        if (parts.length > 1) {
          const rest = parts.slice(1).join(" ");
          const durMatch = rest.match(/(\d+\s*(days|day|weeks|week|months|month))/i);
          if (durMatch) dur = durMatch[0];

          if (/twice|2 times|1-0-1|bid/i.test(rest)) freq = "2 times a day (1-0-1)";
          else if (/thrice|3 times|1-1-1|tid/i.test(rest)) freq = "3 times a day (1-1-1)";
          else if (/0-1-0|afternoon/i.test(rest)) freq = "1 time a day (Afternoon)";
          else if (/0-0-1|night/i.test(rest)) freq = "1 time a day (Night)";
          else if (/once|1 time|1-0-0|morning|od/i.test(rest)) freq = "1 time a day (Morning)";
          else if (/4 times|qid/i.test(rest)) freq = "4 times a day";
          else if (/prn|as needed|sos/i.test(rest)) freq = "As needed (SOS)";
          else if (parts[1]) freq = parts[1];

          if (/after (meals|food|dinner|lunch)/i.test(rest)) inst = "After food";
          else if (/before (meals|food|breakfast)/i.test(rest)) inst = "Before food";
          else if (/empty stomach/i.test(rest)) inst = "Empty stomach";
          else if (/bedtime|night/i.test(rest)) inst = "At bedtime";
        }

        parsed.push({
          medicineName: name,
          frequency: freq,
          duration: dur,
          instructions: inst,
        });
      } else {
        parsed.push({
          medicineName: cleanLine,
          frequency: "2 times a day (1-0-1)",
          duration: "5 Days",
          instructions: "Take with water after food",
        });
      }
    }

    return parsed.length > 0
      ? parsed
      : [
          {
            medicineName: rec.description,
            frequency: "2 times a day (1-0-1)",
            duration: "5 Days",
            instructions: "Take as directed by physician",
          },
        ];
  };

  const handlePrintPrescription = (rec: HealthRecord) => {
    const meds = parseMedicationsFromRecord(rec);

    const printFrame = document.createElement("iframe");
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "0";
    document.body.appendChild(printFrame);

    const doc = printFrame.contentWindow?.document;
    if (!doc) return;

    const medsTableRows = meds
      .map(
        (m, idx) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 9px 12px; text-align: center; font-weight: 700; color: #64748b; font-size: 11px;">${idx + 1}</td>
          <td style="padding: 9px 12px; font-weight: 700; color: #0f172a; font-size: 12px;">
            ${m.medicineName}
            ${m.dosage ? `<div style="font-size: 10px; color: #64748b; font-weight: 400; margin-top: 2px;">Dosage: ${m.dosage}</div>` : ""}
          </td>
          <td style="padding: 9px 12px; font-size: 11px; font-weight: 600; color: #047857;">
            <span style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 3px 8px; border-radius: 6px; display: inline-block;">
              ${m.frequency}
            </span>
          </td>
          <td style="padding: 9px 12px; font-size: 11px; font-weight: 600; color: #0369a1;">
            <span style="background: #f0f9ff; border: 1px solid #bae6fd; padding: 3px 8px; border-radius: 6px; display: inline-block;">
              ${m.duration}
            </span>
          </td>
          <td style="padding: 9px 12px; font-size: 11px; font-weight: 500; color: #92400e;">
            <span style="background: #fffbeb; border: 1px solid #fde68a; padding: 3px 8px; border-radius: 6px; display: inline-block;">
              ${m.instructions}
            </span>
          </td>
        </tr>
      `
      )
      .join("");

    const printHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Prescription - ${rec.patientName} (${rec.recordDate})</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm 14mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            }
            body {
              background: #ffffff;
              color: #0f172a;
              padding: 12px;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .prescription-card {
              border: 1.5px solid #0d9488;
              border-radius: 12px;
              padding: 20px 24px;
              background: #ffffff;
              page-break-inside: avoid;
              break-inside: avoid;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px dashed #cbd5e1;
              padding-bottom: 14px;
              margin-bottom: 16px;
            }
            .clinic-tag {
              font-size: 10px;
              font-weight: 800;
              color: #0d9488;
              text-transform: uppercase;
              letter-spacing: 0.8px;
            }
            .clinic-name {
              font-size: 18px;
              font-weight: 800;
              color: #0f172a;
              margin: 2px 0 3px;
            }
            .physician {
              font-size: 12px;
              color: #475569;
              font-weight: 600;
            }
            .patient-meta {
              text-align: right;
              font-size: 11px;
              color: #64748b;
              line-height: 1.5;
            }
            .patient-meta strong {
              color: #0f172a;
            }
            .verified-badge {
              display: inline-block;
              background: #ecfdf5;
              color: #059669;
              border: 1px solid #a7f3d0;
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 9px;
              font-weight: 700;
              margin-top: 3px;
            }
            .rx-title {
              display: flex;
              align-items: center;
              gap: 8px;
              font-size: 12px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #0f172a;
              margin-bottom: 10px;
            }
            .rx-symbol {
              font-size: 22px;
              font-family: Georgia, serif;
              font-weight: bold;
              color: #0d9488;
              line-height: 1;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              overflow: hidden;
              margin-bottom: 14px;
            }
            th {
              background-color: #f8fafc;
              color: #475569;
              font-size: 10px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              padding: 8px 12px;
              text-align: left;
              border-bottom: 1.5px solid #cbd5e1;
            }
            .advice-box {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 10px 12px;
              margin-top: 10px;
              font-size: 11px;
              color: #334155;
              line-height: 1.45;
            }
            .advice-header {
              font-weight: 800;
              font-size: 10px;
              text-transform: uppercase;
              color: #64748b;
              margin-bottom: 3px;
            }
            .footer-section {
              margin-top: 20px;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              padding-top: 12px;
              border-top: 1px solid #e2e8f0;
            }
            .record-id {
              font-size: 10px;
              color: #94a3b8;
            }
            .signature-block {
              text-align: right;
            }
            .sig-line {
              display: inline-block;
              border-top: 1.5px solid #475569;
              width: 150px;
              padding-top: 4px;
              font-size: 11px;
              font-weight: 700;
              color: #334155;
            }
          </style>
        </head>
        <body>
          <div class="prescription-card">
            <div class="header">
              <div>
                <div class="clinic-tag">${rec.isAutoGenerated ? "Official Telehealth Prescription" : "Medical Diagnostic Record"}</div>
                <div class="clinic-name">${rec.hospitalName || "CuraPulse Health Network"}</div>
                ${rec.doctorName ? `<div class="physician">Physician: ${rec.doctorName}</div>` : ""}
              </div>
              <div class="patient-meta">
                <div>Patient: <strong>${rec.patientName}</strong></div>
                <div>Issued Date: <strong>${rec.recordDate}</strong></div>
                ${rec.isAutoGenerated ? `<div class="verified-badge">✓ Verified Digital Signature</div>` : ""}
              </div>
            </div>

            <div class="rx-title">
              <span class="rx-symbol">℞</span>
              <span>Prescribed Medications & Dosage Schedule</span>
            </div>

            <table>
              <thead>
                <tr>
                  <th style="width: 36px; text-align: center;">#</th>
                  <th>Tablet / Drug Name</th>
                  <th>Times / Day (Frequency)</th>
                  <th>Prescribed Duration</th>
                  <th>Instructions & Timing</th>
                </tr>
              </thead>
              <tbody>
                ${medsTableRows}
              </tbody>
            </table>

            ${
              rec.description
                ? `
              <div class="advice-box">
                <div class="advice-header">Physician Clinical Diagnosis & Advice</div>
                <div>${rec.description.replace(/\n/g, "<br/>")}</div>
              </div>
            `
                : ""
            }

            <div class="footer-section">
              <div class="record-id">
                Record ID: #${rec._id.substring(0, 8)}<br/>
                Issued via CuraPulse Secure Health Network
              </div>
              <div class="signature-block">
                <div class="sig-line">
                  Authorized Signature<br/>
                  <span style="font-size: 9px; font-weight: 500; color: #94a3b8;">${rec.doctorName || "CuraPulse Medical Staff"}</span>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    doc.open();
    doc.write(printHTML);
    doc.close();

    // Trigger print after rendering
    setTimeout(() => {
      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(printFrame);
      }, 1500);
    }, 250);
  };

  const applySampleTemplate = (type: "xray" | "blood" | "prescription") => {
    if (type === "xray") {
      setTitle("Chest Digital X-Ray & Thorax Screening");
      setCategory("scanning");
      setDoctorName("Dr. Sarah Lin, MD (Radiology)");
      setHospitalName("Metropolitan Advanced Diagnostics Center");
      setDescription("Normal lung expansion, no acute cardiopulmonary abnormalities detected. Pleural spaces clear.");
      setFileName("Chest_XRay_PA_View.jpg");
      setFileSize("3.4 MB");
      setFileUrl("https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80");
      setTags("X-Ray, Thorax, Radiology, Routine");
    } else if (type === "blood") {
      setTitle("Comprehensive Metabolic & Lipid Profile");
      setCategory("lab_report");
      setDoctorName("Quest Diagnostic Pathology Labs");
      setHospitalName("St. Jude General Hospital Laboratories");
      setDescription("Total Cholesterol: 185 mg/dL (Desirable), HDL: 56 mg/dL, LDL: 104 mg/dL, Fasting Glucose: 92 mg/dL.");
      setFileName("Lipid_Metabolic_Panel_Report.pdf");
      setFileSize("1.8 MB");
      setFileUrl("https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&auto=format&fit=crop&q=80");
      setTags("Blood Test, Lipid, Glucose, Annual");
    } else {
      setTitle("Amoxicillin & Ibuprofen Clinical Prescription");
      setCategory("prescription");
      setDoctorName("Dr. Marcus Wright, MD");
      setHospitalName("Metropolitan Heart & Wellness Clinic");
      setDescription("Patient diagnosed with acute upper respiratory tract infection. Advised bed rest and warm fluids.");
      setMedications([
        {
          medicineName: "Amoxicillin 500mg",
          dosage: "500mg",
          frequency: "3 times a day (1-1-1)",
          duration: "7 Days",
          instructions: "After food",
        },
        {
          medicineName: "Ibuprofen 400mg",
          dosage: "400mg",
          frequency: "2 times a day (1-0-1)",
          duration: "5 Days",
          instructions: "After food (SOS for pain)",
        },
        {
          medicineName: "Pantoprazole 40mg",
          dosage: "40mg",
          frequency: "1 time a day (1-0-0)",
          duration: "7 Days",
          instructions: "Before breakfast (Empty stomach)",
        },
      ]);
      setFileName("Rx_Clinical_Prescription.pdf");
      setFileSize("850 KB");
      setFileUrl("https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80");
      setTags("Prescription, Antibiotics, Recovery");
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setUploading(true);

    try {
      const validMeds =
        category === "prescription"
          ? medications.filter((m) => m.medicineName.trim().length > 0)
          : undefined;

      const payload: CreateRecordPayload = {
        title,
        category,
        recordDate,
        doctorName: doctorName.trim() || undefined,
        hospitalName: hospitalName.trim() || undefined,
        description: description.trim() || undefined,
        medications: validMeds && validMeds.length > 0 ? validMeds : undefined,
        fileName: fileName || undefined,
        fileUrl: fileUrl || undefined,
        fileSize: fileSize || undefined,
        tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      };

      const res = await recordService.createRecord(payload);
      if (res.success) {
        setIsUploadModalOpen(false);
        // Reset form
        setTitle("");
        setDescription("");
        setDoctorName("");
        setHospitalName("");
        setMedications([
          {
            medicineName: "",
            frequency: "2 times a day (1-0-1)",
            duration: "5 Days",
            instructions: "After food",
          },
        ]);
        setTags("");
        setFileUrl("");
        setFileName("");
        setFileSize("");
        fetchRecords();
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Failed to upload record");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this medical record?")) return;
    try {
      const res = await recordService.deleteRecord(id);
      if (res.success) {
        setRecords((prev) => prev.filter((r) => r._id !== id));
      }
    } catch (err) {
      console.error("Failed to delete record:", err);
    }
  };

  const getCategoryBadge = (cat: RecordCategory, isAuto?: boolean) => {
    if (isAuto) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold shadow-sm">
          <Sparkles className="w-3 h-3" />
          <span>Auto-Synced Prescription</span>
        </span>
      );
    }

    switch (cat) {
      case "prescription":
        return <Badge variant="success">Prescription</Badge>;
      case "scanning":
        return <Badge variant="primary">Scanning & Imaging</Badge>;
      case "lab_report":
        return <Badge variant="secondary">Lab & Blood Test</Badge>;
      case "discharge_summary":
        return <Badge variant="warning">Discharge Summary</Badge>;
      case "vaccination":
        return <Badge variant="success">Vaccination</Badge>;
      default:
        return <Badge variant="secondary">Medical Document</Badge>;
    }
  };

  const getCategoryIcon = (cat: RecordCategory) => {
    switch (cat) {
      case "prescription":
        return Stethoscope;
      case "scanning":
        return Activity;
      case "lab_report":
        return Microscope;
      case "discharge_summary":
        return FileCheck;
      default:
        return FileText;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-bold mb-2 border border-teal-200 dark:border-teal-800">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Encrypted Patient Health Records</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
            My Medical Records & Prescriptions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Store clinical scanning reports, lab results, previous records, and access auto-synced doctor prescriptions.
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="btn-primary !py-3 !px-5 !text-xs self-start md:self-auto flex items-center gap-2 shadow-lg shadow-teal-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Medical Record</span>
        </button>
      </div>

      {/* Summary Stat Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setSelectedCategory("all")}
          className={`card-health p-4.5 cursor-pointer transition-all ${
            selectedCategory === "all" ? "border-teal-500 ring-2 ring-teal-500/20 shadow-md" : "hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Records</span>
            <FileText className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-display mt-2">
            {counts.total}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">All files & prescriptions</div>
        </div>

        <div
          onClick={() => setSelectedCategory("prescription")}
          className={`card-health p-4.5 cursor-pointer transition-all ${
            selectedCategory === "prescription" ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-md" : "hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Prescriptions
            </span>
            <Stethoscope className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-display mt-2">
            {counts.prescription}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Doctor & uploaded Rx</div>
        </div>

        <div
          onClick={() => setSelectedCategory("scanning")}
          className={`card-health p-4.5 cursor-pointer transition-all ${
            selectedCategory === "scanning" ? "border-sky-500 ring-2 ring-sky-500/20 shadow-md" : "hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              Scannings & X-Rays
            </span>
            <Activity className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-extrabold text-sky-600 dark:text-sky-400 font-display mt-2">
            {counts.scanning}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">MRI, CT Scans, Ultrasounds</div>
        </div>

        <div
          onClick={() => setSelectedCategory("lab_report")}
          className={`card-health p-4.5 cursor-pointer transition-all ${
            selectedCategory === "lab_report" ? "border-indigo-500 ring-2 ring-indigo-500/20 shadow-md" : "hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Lab & Blood Tests
            </span>
            <Microscope className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-display mt-2">
            {counts.lab_report}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Pathology & Diagnostics</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card-health p-4 sm:p-5 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search records by title, doctor name, hospital, medication, or tag..."
              className="input-health !pl-10 text-xs"
            />
          </div>

          <button type="submit" className="btn-primary !py-2.5 !px-5 !text-xs shrink-0">
            Search Records
          </button>
        </form>

        {/* Filter Pills */}
        <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 max-w-full">
            {[
              { id: "all", label: "All Records", icon: FileText },
              { id: "prescription", label: "Prescriptions", icon: Stethoscope },
              { id: "scanning", label: "Scannings & X-Rays", icon: Activity },
              { id: "lab_report", label: "Lab Reports", icon: Microscope },
              { id: "discharge_summary", label: "Discharge Summaries", icon: FileCheck },
              { id: "other", label: "Other Documents", icon: Tag },
            ].map((tab) => {
              const IconComp = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                    selectedCategory === tab.id
                      ? "bg-teal-600 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span>Sort:</span>
            <select
              value={sortOption}
              onChange={(e: any) => setSortOption(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="newest" className="dark:bg-slate-900">Newest Date</option>
              <option value="oldest" className="dark:bg-slate-900">Oldest Date</option>
            </select>
          </div>
        </div>
      </div>

      {/* Auto-Sync Banner */}
      <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-900/60 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">
              Automated Doctor Prescription Sync Active
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              When a doctor issues or updates a prescription for any of your appointments, it automatically syncs here with verified clinical notes.
            </div>
          </div>
        </div>

        <Link to="/my-appointments" className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1">
          <span>View Appointments</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Records Feed */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card-health p-6 animate-pulse h-48"></div>
          <div className="card-health p-6 animate-pulse h-48"></div>
        </div>
      ) : records.length === 0 ? (
        <div className="card-health p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            No Health Records Found
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery
              ? `No records match your search "${searchQuery}". Try changing your search query or filter.`
              : "You haven't uploaded any medical reports yet, and no appointments currently have issued prescriptions."}
          </p>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="btn-primary !py-2.5 !px-5 !text-xs inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Your First Record</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {records.map((rec) => {
            const IconComp = getCategoryIcon(rec.category);
            return (
              <div
                key={rec._id}
                className="card-health p-5 sm:p-6 flex flex-col justify-between space-y-4 hover:border-teal-500/50 hover:shadow-xl transition-all group"
              >
                <div className="space-y-3">
                  {/* Top Row: Category and Auto Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div>
                        {getCategoryBadge(rec.category, rec.isAutoGenerated)}
                      </div>
                    </div>

                    <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{rec.recordDate}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-1">
                    {rec.title}
                  </h3>

                  {/* Doctor & Hospital info */}
                  <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                    {rec.doctorName && (
                      <div className="flex items-center gap-1.5 font-medium">
                        <Stethoscope className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span className="truncate">{rec.doctorName}</span>
                      </div>
                    )}
                    {rec.hospitalName && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{rec.hospitalName}</span>
                      </div>
                    )}
                  </div>

                  {/* Clinical Description / Rx Preview */}
                  {rec.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 line-clamp-3 leading-relaxed font-mono text-[11px]">
                      {rec.description}
                    </p>
                  )}

                  {/* Attached File Chip */}
                  {rec.fileName && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-teal-50/50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/40 text-xs text-teal-800 dark:text-teal-300">
                      <Paperclip className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span className="truncate font-medium flex-1 text-[11px]">
                        {rec.fileName}
                      </span>
                      {rec.fileSize && (
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {rec.fileSize}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Tags */}
                  {rec.tags && rec.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {rec.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-medium"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setViewingRecord(rec)}
                    className="flex-1 py-2 px-3 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Record</span>
                  </button>

                  {!rec.isAutoGenerated && (
                    <button
                      onClick={() => handleDeleteRecord(rec._id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      title="Delete Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* UPLOAD MEDICAL RECORD MODAL                                               */}
      {/* ========================================================================= */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Upload Health Record & Reports
                  </h3>
                  <p className="text-xs text-slate-500">
                    Add previous prescriptions, scanning images, or lab blood tests
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Sample Template Buttons */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                ⚡ Quick Fill Sample Template
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => applySampleTemplate("prescription")}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-800 text-[11px] font-semibold text-teal-700 dark:text-teal-300 hover:bg-teal-50"
                >
                  Rx Prescription Sample
                </button>
                <button
                  type="button"
                  onClick={() => applySampleTemplate("xray")}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-800 text-[11px] font-semibold text-sky-700 dark:text-sky-300 hover:bg-sky-50"
                >
                  X-Ray Scan Sample
                </button>
                <button
                  type="button"
                  onClick={() => applySampleTemplate("blood")}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50"
                >
                  Blood Test Report Sample
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Record Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Chest Digital X-Ray Report"
                    className="input-health text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="input-health text-xs"
                  >
                    <option value="prescription">Prescription</option>
                    <option value="scanning">Scanning & Imaging (MRI/X-Ray/CT)</option>
                    <option value="lab_report">Lab & Blood Test Report</option>
                    <option value="discharge_summary">Discharge Summary</option>
                    <option value="vaccination">Vaccination Record</option>
                    <option value="other">Other Medical Document</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Record Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={recordDate}
                    onChange={(e) => setRecordDate(e.target.value)}
                    className="input-health text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Doctor Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    placeholder="e.g. Dr. Jonathan Hayes"
                    className="input-health text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Hospital / Lab (Optional)
                  </label>
                  <input
                    type="text"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    placeholder="e.g. Metro Diagnostic Lab"
                    className="input-health text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Clinical Diagnosis, Advice or General Notes
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter medical diagnosis, doctor's advice, lab readings, or clinical summary..."
                  className="input-health text-xs font-mono"
                ></textarea>
              </div>

              {/* Prescribed Medications Table Builder (when category is prescription) */}
              {category === "prescription" && (
                <div className="space-y-3 p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200/70 dark:border-teal-900/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Pill className="w-4 h-4 text-teal-600" />
                      <span className="text-xs font-bold text-teal-950 dark:text-teal-200 uppercase tracking-wider">
                        Prescribed Medications & Tablets (Table Details)
                      </span>
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

                  <div className="space-y-2.5">
                    {medications.map((med, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
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
                            placeholder="e.g. Paracetamol 650mg"
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

                        <div className="sm:col-span-1 flex justify-end sm:justify-center pt-2 sm:pt-4">
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
              )}

              {/* File Attachment Dropzone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Upload Attachment (PDF, Image, Scanned Report)
                </label>
                <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-center space-y-2">
                  <UploadCloud className="w-8 h-8 text-teal-600 mx-auto" />
                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    <label className="font-bold text-teal-600 dark:text-teal-400 cursor-pointer hover:underline">
                      Click to choose file
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>{" "}
                    or drag & drop here
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Supports PNG, JPG, PDF, DOC up to 25MB
                  </div>

                  {fileName && (
                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-100/70 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-bold">
                      <Paperclip className="w-3.5 h-3.5" />
                      <span>{fileName}</span>
                      {fileSize && <span className="text-[10px] text-slate-400">({fileSize})</span>}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g. Cardio, X-Ray, Blood, Annual"
                  className="input-health text-xs"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="btn-primary !py-2.5 !px-6 !text-xs flex items-center gap-2"
                >
                  {uploading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      <span>Save Health Record</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RECORD DETAIL & PRESCRIPTION VIEWER MODAL                                 */}
      {/* ========================================================================= */}
      {viewingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-4xl w-full shadow-2xl space-y-6 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 no-print">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {viewingRecord.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{viewingRecord.recordDate}</span>
                    <span>•</span>
                    <span>{viewingRecord.category.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handlePrintPrescription(viewingRecord)}
                  className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 no-print"
                  title="Print Record"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewingRecord(null)}
                  className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 no-print"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Prescription Slip or Medical Sheet */}
            <div
              id="printable-prescription"
              className="p-6 rounded-2xl bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 border border-slate-200 dark:border-slate-800 space-y-6"
            >
              {/* Slip Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-dashed border-slate-200 dark:border-slate-800">
                <div>
                  <div className="text-xs font-bold text-teal-600 uppercase tracking-wider">
                    {viewingRecord.isAutoGenerated ? "Official Telehealth Prescription" : "Medical Diagnostic Record"}
                  </div>
                  <div className="text-lg font-extrabold text-slate-900 dark:text-white">
                    {viewingRecord.hospitalName || "CuraPulse Health Network"}
                  </div>
                  {viewingRecord.doctorName && (
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      Physician: {viewingRecord.doctorName}
                    </div>
                  )}
                </div>

                <div className="text-left sm:text-right text-xs text-slate-500 space-y-1">
                  <div>Patient: <strong className="text-slate-800 dark:text-white">{viewingRecord.patientName}</strong></div>
                  <div>Issued Date: <strong className="text-slate-800 dark:text-white">{viewingRecord.recordDate}</strong></div>
                  {viewingRecord.isAutoGenerated && (
                    <div className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verified Digital Signature</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Rx Emblem & Prescribed Medications Table */}
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 font-serif font-black text-2xl flex items-center justify-center border border-teal-500/20 shadow-sm">
                      ℞
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                        Prescribed Medications & Dosage Schedule
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Official tablet details, daily frequency, prescribed duration, and meal instructions
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center gap-1.5">
                    <Pill className="w-3.5 h-3.5 text-teal-600" />
                    <span>{parseMedicationsFromRecord(viewingRecord).length} Prescribed Item(s)</span>
                  </span>
                </div>

                {/* Structured Medication Table */}
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50/90 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-3.5 w-12 text-center">#</th>
                        <th className="py-3 px-4">Tablet / Drug Name</th>
                        <th className="py-3 px-4">Times / Day (Frequency)</th>
                        <th className="py-3 px-4">Prescribed Days (Duration)</th>
                        <th className="py-3 px-4">Instructions & Timing</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {parseMedicationsFromRecord(viewingRecord).map((med, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-teal-50/30 dark:hover:bg-teal-950/20 transition-colors"
                        >
                          <td className="py-3.5 px-3.5 text-center font-bold text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-teal-100/60 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                                <Pill className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white text-xs">
                                  {med.medicineName}
                                </div>
                                {med.dosage && (
                                  <div className="text-[10px] text-slate-400 font-medium">
                                    Dosage: {med.dosage}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 font-semibold text-xs">
                              <Clock className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                              <span>{med.frequency}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-800/60 text-sky-700 dark:text-sky-300 font-semibold text-xs">
                              <Calendar className="w-3.5 h-3.5 shrink-0 text-sky-600" />
                              <span>{med.duration}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 font-medium text-xs">
                              <Utensils className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                              <span>{med.instructions}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Additional Clinical Remarks / Advice if available */}
                {viewingRecord.description && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                    <div className="font-bold text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-teal-600" />
                      <span>Physician Clinical Diagnosis & Lifestyle Advice</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 font-mono text-[11px] leading-relaxed whitespace-pre-line">
                      {viewingRecord.description}
                    </p>
                  </div>
                )}
              </div>

              {/* File Attachment / Image Preview */}
              {viewingRecord.fileUrl && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Attached Diagnostic Imaging / File
                  </span>
                  <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 flex items-center justify-center p-2 max-h-80">
                    <img
                      src={viewingRecord.fileUrl}
                      alt={viewingRecord.title}
                      className="max-h-72 object-contain rounded-xl"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-2 no-print">
              <div className="text-xs text-slate-400">
                Record ID: #{viewingRecord._id.substring(0, 8)}
              </div>
              <button
                type="button"
                onClick={() => setViewingRecord(null)}
                className="btn-primary !py-2 !px-6 !text-xs no-print"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
