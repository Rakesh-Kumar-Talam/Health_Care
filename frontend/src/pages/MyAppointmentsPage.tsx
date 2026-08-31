import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { appointmentService } from "../services/appointmentService";
import { Appointment } from "../types";
import { Badge } from "../components/common/Badge";
import { VideoCallModal } from "../components/appointment/VideoCallModal";
import {
  Calendar,
  Clock,
  Video,
  Building2,
  AlertCircle,
  FileText,
  Phone,
  CheckCircle2,
  XCircle,
  Stethoscope,
  ArrowRight,
} from "lucide-react";

export const MyAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [activeVideoModal, setActiveVideoModal] = useState<Appointment | null>(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentService.getMyPatientAppointments(
        filterStatus !== "all" ? filterStatus : undefined
      );
      if (res.success) setAppointments(res.appointments);
    } catch (err) {
      console.error("Failed to load appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [filterStatus]);

  const handleCancel = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;

    try {
      const res = await appointmentService.cancelAppointment(id);
      if (res.success) {
        setAppointments((prev) =>
          prev.map((app) => (app._id === id ? { ...app, status: "cancelled" } : app))
        );
      }
    } catch (err) {
      console.error("Failed to cancel:", err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge variant="success">Confirmed</Badge>;
      case "completed":
        return <Badge variant="primary">Completed</Badge>;
      case "cancelled":
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge variant="warning">Pending</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-bold mb-2 border border-teal-200 dark:border-teal-800">
            <Calendar className="w-3.5 h-3.5 text-teal-600" />
            <span>Patient Appointment Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
            My Appointments & Consultations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track upcoming visits, launch encrypted telehealth rooms, or review past prescriptions
          </p>
        </div>

        <Link to="/doctors" className="btn-primary !py-2.5 !px-5 !text-xs self-start sm:self-auto flex items-center gap-2">
          <Stethoscope className="w-4 h-4" />
          <span>Book New Appointment</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {["all", "confirmed", "completed", "cancelled"].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
              filterStatus === st
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
        <div className="card-health p-12 text-center space-y-4">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <div className="text-base font-bold text-slate-800 dark:text-white">
            No appointments found
          </div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You do not have any {filterStatus !== "all" ? filterStatus : ""} appointments scheduled yet.
          </p>
          <Link to="/doctors" className="btn-primary !py-2.5 !px-5 !text-xs inline-flex">
            Discover Doctors & Book Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((app) => (
            <div
              key={app._id}
              className="card-health p-5 sm:p-6 transition-all hover:border-slate-300 dark:hover:border-slate-700 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Doctor Avatar & Specialty */}
                <div className="flex items-center space-x-4">
                  <img
                    src={app.doctorAvatar || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&auto=format&fit=crop&q=80"}
                    alt={app.doctorName}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-teal-500/30 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/doctors/${app.doctorId}`}
                        className="text-base font-bold text-slate-900 dark:text-white hover:text-teal-600 transition-colors"
                      >
                        {app.doctorName}
                      </Link>
                      {getStatusBadge(app.status)}
                    </div>
                    <div className="text-xs font-semibold text-teal-600 dark:text-teal-400">
                      {app.doctorSpecialty} • {app.hospitalName}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Reason: <strong className="text-slate-700 dark:text-slate-300">{app.reason}</strong>
                    </div>
                  </div>
                </div>

                {/* Date & Mode Pills */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-teal-600" />
                    <span>{app.appointmentDate}</span>
                    <span>•</span>
                    <Clock className="w-4 h-4 text-teal-600" />
                    <span>{app.timeSlot}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5">
                    {app.type === "video" ? (
                      <>
                        <Video className="w-4 h-4 text-sky-500" />
                        <span className="text-sky-600 dark:text-sky-400">Video Telehealth</span>
                      </>
                    ) : (
                      <>
                        <Building2 className="w-4 h-4 text-teal-600" />
                        <span className="text-teal-600 dark:text-teal-400">In-Person Clinic</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Patient Symptoms or Clinical Notes */}
              {app.symptoms && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 space-y-0.5">
                  <span className="font-bold text-slate-500 text-[10px] uppercase tracking-wider block">
                    Recorded Symptoms
                  </span>
                  <p>{app.symptoms}</p>
                </div>
              )}

              {/* Doctor Prescription & Notes (if completed) */}
              {app.notes && (
                <div className="p-3.5 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/60 text-xs text-teal-900 dark:text-teal-200 space-y-1">
                  <span className="font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Physician Clinical Notes & Prescription</span>
                  </span>
                  <p className="leading-relaxed">{app.notes}</p>
                  {app.prescription && (
                    <div className="pt-1 font-mono text-[11px] text-teal-700 dark:text-teal-300">
                      Rx: {app.prescription}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                <div className="text-xs text-slate-500 font-semibold">
                  Fee: <strong className="text-slate-900 dark:text-white">${app.fee}</strong> ({app.paymentStatus})
                </div>

                <div className="flex items-center gap-2">
                  {app.status === "confirmed" && app.type === "video" && (
                    <button
                      onClick={() => setActiveVideoModal(app)}
                      className="btn-primary !py-2 !px-4 !text-xs flex items-center gap-1.5 shadow-md"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Telehealth Call</span>
                    </button>
                  )}

                  {app.status === "confirmed" && (
                    <button
                      onClick={() => handleCancel(app._id)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 transition-colors"
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

      {activeVideoModal && (
        <VideoCallModal
          appointment={activeVideoModal}
          onClose={() => setActiveVideoModal(null)}
        />
      )}
    </div>
  );
};