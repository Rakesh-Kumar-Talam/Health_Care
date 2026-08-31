import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { statsService } from "../services/statsService";
import { appointmentService } from "../services/appointmentService";
import { useAuth } from "../context/AuthContext";
import { Appointment } from "../types";
import { Badge } from "../components/common/Badge";
import { PostEditorModal } from "../components/doctor/PostEditorModal";
import { ReelEditorModal } from "../components/doctor/ReelEditorModal";
import {
  Users,
  Calendar,
  Eye,
  Star,
  DollarSign,
  TrendingUp,
  Clock,
  Video,
  Building2,
  PlusCircle,
  Film,
  CheckCircle2,
  FileText,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export const DoctorDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [reelModalOpen, setReelModalOpen] = useState(false);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await statsService.getDoctorDashboardStats();
      if (res.success) {
        setStatsData(res);
      }
    } catch (err) {
      console.error("Failed to load doctor dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await appointmentService.updateStatus(id, { status: newStatus });
      if (res.success) {
        fetchDashboard();
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  if (loading || !statsData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
      </div>
    );
  }

  const { stats, weeklyTrend, patientDemographics, consultationTypes, recentAppointments } = statsData;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="card-health p-6 sm:p-8 bg-gradient-to-r from-teal-800 via-teal-900 to-slate-950 text-white border-0 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-700/60 backdrop-blur-md text-xs font-bold text-teal-200 border border-teal-500/40">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
              <span>Verified Physician Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display">
              Welcome back, {user?.name || "Dr. Alexander Wright"}
            </h1>
            <p className="text-xs sm:text-sm text-teal-200/90 max-w-xl">
              You have <strong className="text-white font-bold">{stats.todayAppointments} appointments</strong> scheduled for today. Your clinical insights have reached over {stats.profileViews} patients this month.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setPostModalOpen(true)}
              className="btn-secondary !py-2.5 !px-4 !text-xs flex items-center gap-1.5 shadow-lg"
            >
              <FileText className="w-4 h-4" />
              <span>Write Health Post</span>
            </button>

            <button
              onClick={() => setReelModalOpen(true)}
              className="btn-primary !py-2.5 !px-4 !text-xs flex items-center gap-1.5 shadow-lg"
            >
              <Film className="w-4 h-4" />
              <span>Upload Video Reel</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="card-health p-5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Patients
            </span>
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
            {stats.totalPatients}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+14% new patients this month</span>
          </div>
        </div>

        <div className="card-health p-5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Appointments
            </span>
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
            {stats.totalAppointments}
          </div>
          <div className="text-[11px] text-slate-400">
            {stats.completedAppointments} Completed • {stats.pendingAppointments} Upcoming
          </div>
        </div>

        <div className="card-health p-5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Profile Views
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
            {stats.profileViews}
          </div>
          <div className="text-[11px] text-purple-600 font-semibold">
            ⭐ {stats.rating.toFixed(1)} rating ({stats.reviewCount} reviews)
          </div>
        </div>

        <div className="card-health p-5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Consultation Revenue
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
            ${stats.totalEarnings}
          </div>
          <div className="text-[11px] text-slate-400">
            ${stats.consultationFee} standard consultation fee
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Trend AreaChart */}
        <div className="lg:col-span-2 card-health p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Weekly Consultation Volume Trend
              </h3>
              <p className="text-xs text-slate-400">Total appointments booked and completed</p>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrend}>
                <defs>
                  <linearGradient id="colorApp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "0.75rem",
                    color: "#f8fafc",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Area type="monotone" dataKey="appointments" name="Booked" stroke="#0d9488" fillOpacity={1} fill="url(#colorApp)" strokeWidth={2} />
                <Area type="monotone" dataKey="completed" name="Completed" stroke="#0284c7" fillOpacity={1} fill="url(#colorComp)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Patient Demographics BarChart */}
        <div className="card-health p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Patient Age Demographics
            </h3>
            <p className="text-xs text-slate-400">Distribution across age groups</p>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={patientDemographics}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="ageGroup" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "0.75rem",
                    color: "#f8fafc",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" name="Patients" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Upcoming Appointments Queue */}
      <div className="card-health p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Recent & Upcoming Patient Consultations
            </h3>
            <p className="text-xs text-slate-400">Review patient symptoms and update status</p>
          </div>
          <Link to="/doctor/appointments" className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1">
            <span>Manage All Bookings</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recentAppointments.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs italic">
            No patient appointments in queue.
          </div>
        ) : (
          <div className="space-y-3">
            {recentAppointments.map((app: Appointment) => (
              <div
                key={app._id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {app.patientName}
                    </span>
                    <Badge variant={app.status === "confirmed" ? "success" : app.status === "completed" ? "primary" : "warning"}>
                      {app.status}
                    </Badge>
                  </div>

                  <div className="text-xs text-slate-500 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-teal-600" />
                      {app.appointmentDate} at {app.timeSlot}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      {app.type === "video" ? <Video className="w-3.5 h-3.5 text-sky-500" /> : <Building2 className="w-3.5 h-3.5 text-teal-600" />}
                      <span className="capitalize">{app.type}</span>
                    </span>
                  </div>

                  {app.symptoms && (
                    <div className="text-xs text-slate-600 dark:text-slate-300 italic pt-0.5">
                      Symptoms: {app.symptoms}
                    </div>
                  )}
                </div>

                {/* Status action buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  {app.status === "confirmed" && (
                    <button
                      onClick={() => handleUpdateStatus(app._id, "completed")}
                      className="btn-primary !py-1.5 !px-3 !text-xs flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Done</span>
                    </button>
                  )}
                  {app.status === "confirmed" && (
                    <button
                      onClick={() => handleUpdateStatus(app._id, "cancelled")}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {postModalOpen && (
        <PostEditorModal
          onClose={() => setPostModalOpen(false)}
          onSaved={() => {
            setPostModalOpen(false);
            fetchDashboard();
          }}
        />
      )}

      {reelModalOpen && (
        <ReelEditorModal
          onClose={() => setReelModalOpen(false)}
          onSaved={() => {
            setReelModalOpen(false);
            fetchDashboard();
          }}
        />
      )}
    </div>
  );
};