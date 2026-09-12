import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";
import {
  Activity,
  Mail,
  Lock,
  ArrowRight,
  User,
  Stethoscope,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export const LoginPage: React.FC = () => {
  const { login, loginAsDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [email, setEmail] = useState("patient@test.com");
  const [password, setPassword] = useState("Patient@123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleChange = (selectedRole: "patient" | "doctor") => {
    setRole(selectedRole);
    if (selectedRole === "patient") {
      setEmail("patient@test.com");
      setPassword("Patient@123");
    } else {
      setEmail("doctor@test.com");
      setPassword("Doctor@123");
    }
  };

  const redirectPath = location.state?.from?.pathname
    ? `${location.state.from.pathname}${location.state.from.search || ""}`
    : null;
  const redirectMessage = location.state?.message;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await authService.login({ email, password });
      if (res.success && res.token && res.user) {
        login(res.user, res.token);
        const destination =
          redirectPath || (res.user.role === "doctor" ? "/doctor/dashboard" : "/feed");
        navigate(destination, { replace: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleOneClickDemo = async (demoRole: "patient" | "doctor") => {
    setLoading(true);
    setError(null);
    try {
      const u = await loginAsDemo(demoRole);
      const destination =
        redirectPath || (u.role === "doctor" ? "/doctor/dashboard" : "/feed");
      navigate(destination, { replace: true });
    } catch (err: any) {
      setError(err.message || "Demo login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
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
            Welcome to CuraPulse
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sign in to access your appointments, medical discovery, or clinician studio
          </p>
        </div>

        {/* Card Container */}
        <div className="card-health p-6 sm:p-8 space-y-6 shadow-xl border border-slate-200 dark:border-slate-800">
          {/* Role Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => handleRoleChange("patient")}
              className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                role === "patient"
                  ? "bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Patient Portal</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleChange("doctor")}
              className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                role === "doctor"
                  ? "bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Doctor Portal</span>
            </button>
          </div>

          {/* Quick 1-Click Demo Action */}
          <div className="p-3.5 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-900/60 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-teal-900 dark:text-teal-300">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>Instant 1-Click Demo Login</span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleOneClickDemo(role)}
              disabled={loading}
              className="w-full py-2 px-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Sign in as Demo {role === "doctor" ? "Doctor (Dr. Wright)" : "Patient (Sarah Jenkins)"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full"></div>
            <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
              or with password
            </span>
          </div>

          {redirectMessage && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Authentication Required</p>
                <p className="mt-0.5 text-amber-700 dark:text-amber-400">{redirectMessage}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
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
                  className="input-health !pl-10 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  <span>Sign In as {role === "doctor" ? "Doctor" : "Patient"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Note */}
          <div className="pt-2 text-center text-xs text-slate-500">
            Do not have an account yet?{" "}
            <Link to="/register" className="font-bold text-teal-600 dark:text-teal-400 hover:underline">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};