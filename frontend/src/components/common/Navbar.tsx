import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import {
  Activity,
  Calendar,
  Stethoscope,
  Building2,
  Compass,
  LayoutDashboard,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  User,
  PlusCircle,
  Video,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, loginAsDemo } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleDemoSwitch = async (role: "patient" | "doctor") => {
    setDemoDropdownOpen(false);
    await loginAsDemo(role);
    if (role === "doctor") {
      navigate("/doctor/dashboard");
    } else {
      navigate("/feed");
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform duration-200">
              <Activity className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
                Cura<span className="text-teal-600 dark:text-teal-400">Pulse</span>
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 -mt-1">
                Healthcare Discovery
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              to="/feed"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                isActive("/feed")
                  ? "bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 font-semibold"
                  : "text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <Compass className="w-4 h-4" />
              Health Feed
            </Link>

            <Link
              to="/doctors"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                isActive("/doctors")
                  ? "bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 font-semibold"
                  : "text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              Find Doctors
            </Link>

            <Link
              to="/hospitals"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                isActive("/hospitals")
                  ? "bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 font-semibold"
                  : "text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <Building2 className="w-4 h-4" />
              Hospitals
            </Link>

            {isAuthenticated && user?.role === "patient" && (
              <Link
                to="/my-appointments"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  isActive("/my-appointments")
                    ? "bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 font-semibold"
                    : "text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <Calendar className="w-4 h-4" />
                My Appointments
              </Link>
            )}

            {isAuthenticated && user?.role === "doctor" && (
              <>
                <Link
                  to="/doctor/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                    isActive("/doctor/dashboard")
                      ? "bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 font-semibold"
                      : "text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>

                <Link
                  to="/doctor/appointments"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                    isActive("/doctor/appointments")
                      ? "bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 font-semibold"
                      : "text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Bookings
                </Link>

                <Link
                  to="/doctor/content"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                    isActive("/doctor/content")
                      ? "bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 font-semibold"
                      : "text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  My Studio
                </Link>
              </>
            )}
          </nav>

          {/* Right Action Icons & Auth Controls */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Quick Demo Switcher */}
            <div className="relative">
              <button
                onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/80 hover:bg-teal-100 transition-colors flex items-center gap-1"
                title="Quick Demo Mode"
              >
                <span>⚡ Demo:</span>
                <span className="capitalize">{user ? user.role : "Select"}</span>
              </button>

              {demoDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Switch 1-Click Role
                  </div>
                  <button
                    onClick={() => handleDemoSwitch("patient")}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-teal-900/30 flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5 text-teal-600" />
                    Patient (Sarah Jenkins)
                  </button>
                  <button
                    onClick={() => handleDemoSwitch("doctor")}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-sky-900/30 flex items-center gap-2"
                  >
                    <Stethoscope className="w-3.5 h-3.5 text-sky-600" />
                    Doctor (Dr. Wright - Cardio)
                  </button>
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* User Profile / Auth Action */}
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3 pl-2 border-l border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <img
                    src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover border-2 border-teal-500/50 shadow-sm"
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-800 dark:text-white leading-tight">
                      {user.name}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                      {user.role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary !py-2 !px-4 !text-sm">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 md:hidden">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-2">
          <Link
            to="/feed"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Health Feed
          </Link>
          <Link
            to="/doctors"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Find Doctors
          </Link>
          <Link
            to="/hospitals"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Hospitals
          </Link>

          {isAuthenticated && user?.role === "patient" && (
            <Link
              to="/my-appointments"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              My Appointments
            </Link>
          )}

          {isAuthenticated && user?.role === "doctor" && (
            <>
              <Link
                to="/doctor/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Doctor Dashboard
              </Link>
              <Link
                to="/doctor/appointments"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Manage Bookings
              </Link>
              <Link
                to="/doctor/content"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                My Posts & Reels
              </Link>
            </>
          )}

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  handleDemoSwitch("patient");
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2 text-xs font-semibold rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800"
              >
                Demo Patient
              </button>
              <button
                onClick={() => {
                  handleDemoSwitch("doctor");
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2 text-xs font-semibold rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800"
              >
                Demo Doctor
              </button>
            </div>

            {isAuthenticated ? (
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-red-600 bg-red-50 dark:bg-red-950/30 flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out ({user?.name})
              </button>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-lg text-sm font-semibold border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-lg text-sm font-semibold bg-teal-600 text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
