import { Medication } from "../types";

export interface ClinicalKit {
  id: string;
  name: string;
  description: string;
  tag: string;
  medications: Medication[];
}

export const BUILT_IN_CLINICAL_KITS: ClinicalKit[] = [
  {
    id: "viral-fever-kit",
    name: "Viral Fever & Body Pain Kit",
    tag: "Fever & Infection",
    description: "Standard 5-day regimen for viral pyrexia, headache, and myalgia",
    medications: [
      {
        medicineName: "Paracetamol 650mg",
        frequency: "3 times a day (1-1-1)",
        duration: "5 Days",
        instructions: "After food",
      },
      {
        medicineName: "Pantoprazole 40mg",
        frequency: "1 time a day (Morning)",
        duration: "5 Days",
        instructions: "Before food (Empty stomach)",
      },
      {
        medicineName: "Cetirizine 10mg",
        frequency: "1 time a day (Night)",
        duration: "5 Days",
        instructions: "Before bedtime",
      },
    ],
  },
  {
    id: "gastritis-regimen",
    name: "Gastritis & Acid Reflux Regimen",
    tag: "Gastroenterology",
    description: "Targeted therapy for acute acid dyspepsia, GERD, and stomach bloating",
    medications: [
      {
        medicineName: "Pantoprazole + Domperidone (Pan-D)",
        frequency: "1 time a day (Morning)",
        duration: "7 Days",
        instructions: "Before food (Empty stomach)",
      },
      {
        medicineName: "Antacid Oral Suspension 15ml",
        frequency: "2 times a day (1-0-1)",
        duration: "5 Days",
        instructions: "After food",
      },
      {
        medicineName: "Probiotic Capsule",
        frequency: "1 time a day (Night)",
        duration: "7 Days",
        instructions: "After food",
      },
    ],
  },
  {
    id: "acute-pain-pack",
    name: "Post-Op & Acute Pain Pack",
    tag: "Analgesic",
    description: "Anti-inflammatory and analgesia for acute sprains, post-op, or dental pain",
    medications: [
      {
        medicineName: "Aceclofenac 100mg + Paracetamol 325mg",
        frequency: "2 times a day (1-0-1)",
        duration: "5 Days",
        instructions: "After food",
      },
      {
        medicineName: "Rabeprazole 20mg",
        frequency: "1 time a day (Morning)",
        duration: "5 Days",
        instructions: "Before food (Empty stomach)",
      },
      {
        medicineName: "Tramadol 50mg",
        frequency: "As needed (SOS)",
        duration: "3 Days",
        instructions: "After food",
      },
    ],
  },
  {
    id: "upper-respiratory-kit",
    name: "Upper Respiratory & Cough Pack",
    tag: "Pulmonology",
    description: "Combination for acute bronchitis, rhinorrhea, and allergic cough",
    medications: [
      {
        medicineName: "Azithromycin 500mg",
        frequency: "1 time a day (Morning)",
        duration: "3 Days",
        instructions: "After food",
      },
      {
        medicineName: "Montelukast 10mg + Levocetirizine 5mg",
        frequency: "1 time a day (Night)",
        duration: "7 Days",
        instructions: "Before bedtime",
      },
      {
        medicineName: "Dextromethorphan + Ambroxol Syrup 10ml",
        frequency: "3 times a day (1-1-1)",
        duration: "5 Days",
        instructions: "After food",
      },
    ],
  },
  {
    id: "hypertension-starter",
    name: "Hypertension Maintenance Kit",
    tag: "Cardiology",
    description: "First-line chronic blood pressure regulation",
    medications: [
      {
        medicineName: "Telmisartan 40mg",
        frequency: "1 time a day (Morning)",
        duration: "30 Days",
        instructions: "After food",
      },
      {
        medicineName: "Amlodipine 5mg",
        frequency: "1 time a day (Night)",
        duration: "30 Days",
        instructions: "Before bedtime",
      },
    ],
  },
];

const CUSTOM_KITS_STORAGE_KEY = "curapulse_doctor_custom_kits";

export const getCustomKits = (): ClinicalKit[] => {
  try {
    const raw = localStorage.getItem(CUSTOM_KITS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to read custom kits:", e);
    return [];
  }
};

export const saveCustomKit = (kit: Omit<ClinicalKit, "id">): ClinicalKit => {
  const existing = getCustomKits();
  const newKit: ClinicalKit = {
    ...kit,
    id: `custom-kit-${Date.now()}`,
  };
  const updated = [newKit, ...existing];
  try {
    localStorage.setItem(CUSTOM_KITS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save custom kit:", e);
  }
  return newKit;
};

export const deleteCustomKit = (id: string) => {
  const existing = getCustomKits();
  const updated = existing.filter((k) => k.id !== id);
  try {
    localStorage.setItem(CUSTOM_KITS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to delete custom kit:", e);
  }
};

export const DEFAULT_QUICK_APPLY_KIT_IDS = [
  "viral-fever-kit",
  "gastritis-regimen",
  "pain-pack",
  "upper-respiratory-kit",
];

const QUICK_APPLY_STORAGE_KEY = "curapulse_quick_apply_kit_ids";

export const getQuickApplyKitIds = (): string[] => {
  try {
    const raw = localStorage.getItem(QUICK_APPLY_STORAGE_KEY);
    if (!raw) return DEFAULT_QUICK_APPLY_KIT_IDS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch (e) {
    console.error("Failed to read quick apply kits:", e);
  }
  return DEFAULT_QUICK_APPLY_KIT_IDS;
};

export const saveQuickApplyKitIds = (ids: string[]): void => {
  try {
    localStorage.setItem(QUICK_APPLY_STORAGE_KEY, JSON.stringify(ids));
  } catch (e) {
    console.error("Failed to save quick apply kits:", e);
  }
};

/**
 * Calculates pharmacy total quantity from frequency and duration strings.
 * e.g., "2 times a day (1-0-1)" for "5 Days" => 10 Units
 */
export interface QuantityCalculation {
  totalUnits: number | null;
  perDay: number;
  days: number;
  isSOS: boolean;
  displayText: string;
}

export const calculateTotalQuantity = (
  frequency: string,
  duration: string
): QuantityCalculation => {
  const freqLower = (frequency || "").toLowerCase();
  const durLower = (duration || "").toLowerCase();

  const isSOS =
    freqLower.includes("sos") ||
    freqLower.includes("as needed") ||
    freqLower.includes("prn");

  // Determine daily doses
  let perDay = 1;
  if (isSOS) {
    perDay = 0;
  } else if (freqLower.includes("4 times") || freqLower.includes("6h") || freqLower.includes("qid")) {
    perDay = 4;
  } else if (freqLower.includes("3 times") || freqLower.includes("1-1-1") || freqLower.includes("tid")) {
    perDay = 3;
  } else if (freqLower.includes("2 times") || freqLower.includes("1-0-1") || freqLower.includes("bid")) {
    perDay = 2;
  } else if (
    freqLower.includes("morning") ||
    freqLower.includes("1-0-0") ||
    freqLower.includes("afternoon") ||
    freqLower.includes("0-1-0") ||
    freqLower.includes("night") ||
    freqLower.includes("0-0-1") ||
    freqLower.includes("1 time")
  ) {
    perDay = 1;
  }

  // Parse days from duration (e.g., "5 Days", "10", "2 weeks", "1 month")
  const numMatch = durLower.match(/\d+/);
  let days = numMatch ? parseInt(numMatch[0], 10) : 5;

  if (durLower.includes("week")) {
    days = days * 7;
  } else if (durLower.includes("month")) {
    days = days * 30;
  }

  if (isSOS) {
    return {
      totalUnits: null,
      perDay: 0,
      days,
      isSOS: true,
      displayText: `As Needed (SOS for ~${days} days)`,
    };
  }

  const totalUnits = perDay * days;
  const unitLabel = totalUnits === 1 ? "Unit / Tab" : "Tablets";

  return {
    totalUnits,
    perDay,
    days,
    isSOS: false,
    displayText: `${totalUnits} ${unitLabel} (${perDay}/day × ${days}d)`,
  };
};

/**
 * Categorizes a list of prescribed medications into chronological time slots:
 * 🌅 Morning (8:00 AM)
 * ☀️ Afternoon (1:00 PM)
 * 🌙 Night (9:00 PM)
 * ⚠️ As Needed (SOS)
 */
export interface TimelineSlotItem {
  medicineName: string;
  dose: string;
  instructions: string;
  duration: string;
  totalQuantityText: string;
}

export interface CategorizedDailyTimeline {
  morning: TimelineSlotItem[];
  afternoon: TimelineSlotItem[];
  night: TimelineSlotItem[];
  asNeeded: TimelineSlotItem[];
  totalActiveMedications: number;
}

export const categorizeByDailyTimeline = (
  medications: Medication[]
): CategorizedDailyTimeline => {
  const morning: TimelineSlotItem[] = [];
  const afternoon: TimelineSlotItem[] = [];
  const night: TimelineSlotItem[] = [];
  const asNeeded: TimelineSlotItem[] = [];

  medications.forEach((med) => {
    if (!med.medicineName || !med.medicineName.trim()) return;

    const qty = calculateTotalQuantity(med.frequency, med.duration);
    const item: TimelineSlotItem = {
      medicineName: med.medicineName,
      dose: "1 Tablet / Dose",
      instructions: med.instructions || "As directed",
      duration: med.duration || "5 Days",
      totalQuantityText: qty.displayText,
    };

    const freqLower = (med.frequency || "").toLowerCase();

    if (
      freqLower.includes("sos") ||
      freqLower.includes("as needed") ||
      freqLower.includes("prn")
    ) {
      asNeeded.push(item);
      return;
    }

    if (freqLower.includes("1-1-1") || freqLower.includes("3 times")) {
      morning.push(item);
      afternoon.push(item);
      night.push(item);
    } else if (freqLower.includes("1-0-1") || freqLower.includes("2 times")) {
      morning.push(item);
      night.push(item);
    } else if (freqLower.includes("4 times") || freqLower.includes("6h")) {
      morning.push({ ...item, dose: "1 Dose (Morning 8 AM)" });
      afternoon.push({ ...item, dose: "1 Dose (Afternoon 1 PM)" });
      night.push({ ...item, dose: "1 Dose (Night 9 PM)" });
      asNeeded.push({ ...item, dose: "1 Dose (Late night / 6h interval)" });
    } else if (freqLower.includes("afternoon") || freqLower.includes("0-1-0")) {
      afternoon.push(item);
    } else if (freqLower.includes("night") || freqLower.includes("0-0-1") || freqLower.includes("bedtime")) {
      night.push(item);
    } else {
      // Default 1 time / day morning or general once a day
      morning.push(item);
    }
  });

  return {
    morning,
    afternoon,
    night,
    asNeeded,
    totalActiveMedications:
      morning.length + afternoon.length + night.length + asNeeded.length,
  };
};
