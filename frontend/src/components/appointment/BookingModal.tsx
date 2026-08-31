import React, { useState } from "react";
import { Doctor } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { appointmentService } from "../../services/appointmentService";
import {
  X,
  Calendar,
  Clock,
  Video,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Building2,
  DollarSign,
} from "lucide-react";

interface BookingModalProps {
  doctor: Doctor;
  onClose: () => void;
  onSuccess: (appointment: any) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ doctor, onClose, onSuccess }) => {
  const { user, isAuthenticated } = useAuth();

  // Next 7 days generator
  const getNextDays = () => {
    const dates = [];
    for (let i = 1; i <= 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push({
        dateStr: d.toISOString().split("T")[0],
        dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
        display: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      });
    }
    return dates;
  };

  const availableDates = getNextDays();
  const [selectedDate, setSelectedDate] = useState<string>(availableDates[0].dateStr);
  const [selectedSlot, setSelectedSlot] = useState<string>(doctor.timeSlots[0] || "10:00 AM");
  const [consultationType, setConsultationType] = useState<"in-person" | "video">("in-person");
  const [reason, setReason] = useState<string>("General Consultation");
  const [symptoms, setSymptoms] = useState<string>("");
  const [phone, setPhone] = useState<string>(user?.phone || "");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError("Please sign in or use demo login to book an appointment.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await appointmentService.bookAppointment({
        doctorId: doctor._id,
        appointmentDate: selectedDate,
        timeSlot: selectedSlot,
        type: consultationType,
        reason,
        symptoms,
        patientPhone: phone,
      });

      if (res.success) {
        setConfirmed(true);
        setTimeout(() => {
          onSuccess(res.appointment);
        }, 1800);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to book appointment. Please try a different slot.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {confirmed ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/50 rounded-full flex items-center justify-center text-teal-600 dark:text-teal-400 mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              Appointment Confirmed!
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm max-w-md mx-auto">
              Your appointment with <span className="font-semibold text-teal-600 dark:text-teal-400">{doctor.name}</span> on{" "}
              <span className="font-semibold">{selectedDate}</span> at <span className="font-semibold">{selectedSlot}</span> has been confirmed.
            </p>
            <div className="text-xs text-slate-400">Redirecting to your appointments...</div>
          </div>
        ) : (
          <div>
            {/* Header Doctor Info */}
            <div className="flex items-center space-x-3.5 pb-5 border-b border-slate-200 dark:border-slate-800">
              <img
                src={doctor.avatar}
                alt={doctor.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-teal-500/40"
              />
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  Book Appointment with {doctor.name}
                </h3>
                <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold mt-0.5">
                  {doctor.specialty} • {doctor.hospitalName}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-500 inline" />
                  <span>Consultation Fee: <strong className="text-slate-800 dark:text-slate-200">${doctor.consultationFee}</strong></span>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-5">
              {/* Consultation Type Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  1. Consultation Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setConsultationType("in-person")}
                    className={`p-3 rounded-xl border-2 text-left flex items-center gap-3 transition-all ${
                      consultationType === "in-person"
                        ? "border-teal-500 bg-teal-50/50 dark:bg-teal-950/30 text-teal-900 dark:text-teal-200 font-semibold"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <Building2 className={`w-5 h-5 ${consultationType === "in-person" ? "text-teal-600" : "text-slate-400"}`} />
                    <div>
                      <div className="text-xs font-bold">In-Person Clinic</div>
                      <div className="text-[10px] text-slate-500">Visit Hospital / Clinic</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConsultationType("video")}
                    className={`p-3 rounded-xl border-2 text-left flex items-center gap-3 transition-all ${
                      consultationType === "video"
                        ? "border-teal-500 bg-teal-50/50 dark:bg-teal-950/30 text-teal-900 dark:text-teal-200 font-semibold"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <Video className={`w-5 h-5 ${consultationType === "video" ? "text-teal-600" : "text-slate-400"}`} />
                    <div>
                      <div className="text-xs font-bold">Video Telehealth</div>
                      <div className="text-[10px] text-slate-500">Instant HD Room Link</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  2. Select Available Date
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {availableDates.map((item) => (
                    <button
                      key={item.dateStr}
                      type="button"
                      onClick={() => setSelectedDate(item.dateStr)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        selectedDate === item.dateStr
                          ? "border-teal-500 bg-teal-600 text-white font-bold shadow-md shadow-teal-600/30"
                          : "border-slate-200 dark:border-slate-800 hover:border-teal-400 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800/60"
                      }`}
                    >
                      <div className="text-[10px] uppercase font-bold opacity-80">{item.dayName}</div>
                      <div className="text-xs font-extrabold mt-0.5">{item.display}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slots */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  3. Select Time Slot
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {doctor.timeSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        selectedSlot === slot
                          ? "border-teal-500 bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 shadow-sm"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Patient Details / Symptoms */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Reason for Visit
                  </label>
                  <input
                    type="text"
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Regular Checkup, Chest Pain, Skin Rash"
                    className="input-health text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Symptoms or Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="Briefly describe what you are experiencing..."
                    className="input-health text-xs resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="input-health text-xs"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary !py-3 !text-sm flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Confirm & Book Appointment</span>
                      <span className="bg-white/20 px-2 py-0.5 rounded text-xs">${doctor.consultationFee}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
