import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";
import {
  Activity,
  User,
  Mail,
  Lock,
  Phone,
  Stethoscope,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

export const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [specialty, setSpecialty] = useState("General Medicine");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await authService.register({
        name,
        email,
        password,
        role,
        phone,
        specialty: role === "doctor" ? specialty : undefined,
      });

      if (res.success && res.token && res.user) {
        login(res.user, res.token);
        const destination = res.user.role === "doctor" ? "/doctor/dashboard" : "/feed";
        navigate(destination);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-600 to-sky-500 flex items-center justify-center text-white shadow-lg">
              <Activity className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
              Cura<span className="text-teal-600 dark:text-teal-400">Pulse</span>
            </span>
          </Link>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Create Your Healthcare Account
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Join CuraPulse as a patient or verified medical clinician
          </p>
        </div>

        <div className="card-health p-6 sm:p-8 space-y-6 shadow-xl border border-slate-200 dark:border-slate-800">
          {/* Role selector */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setRole("patient")}
              className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                role === "patient"
                  ? "bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>I am a Patient</span>
            </button>

            <button
              type="button"
              onClick={() => setRole("doctor")}
              className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                role === "doctor"
                  ? "bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>I am a Doctor</span>
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Full Legal Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={role === "doctor" ? "Dr. Jonathan Hayes, MD" : "Sarah Jenkins"}
                  className="input-health !pl-10 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="input-health !pl-10 text-xs"
                />
              </div>
            </div>

            {role === "doctor" && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Primary Medical Specialty
                </label>
                <div className="relative">
                  <Stethoscope className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="input-health !pl-10 text-xs"
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Oncology">Oncology</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Psychiatry">Psychiatry</option>
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="input-health !pl-10 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Create Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="input-health !pl-10 text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary !py-3 !text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Create {role === "doctor" ? "Doctor" : "Patient"} Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-teal-600 dark:text-teal-400 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};