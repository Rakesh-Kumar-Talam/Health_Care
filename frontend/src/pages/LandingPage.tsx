import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { doctorService } from "../services/doctorService";
import { hospitalService } from "../services/hospitalService";
import { statsService } from "../services/statsService";
import { DoctorCard } from "../components/doctor/DoctorCard";
import { HospitalCard } from "../components/hospital/HospitalCard";
import { Doctor, Hospital } from "../types";
import {
  Activity,
  Search,
  Stethoscope,
  Building2,
  Calendar,
  ShieldCheck,
  Star,
  Users,
  Video,
  HeartPulse,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
} from "lucide-react";

export const LandingPage: React.FC = () => {
  const { loginAsDemo, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [featuredDoctors, setFeaturedDoctors] = useState<Doctor[]>([]);
  const [featuredHospitals, setFeaturedHospitals] = useState<Hospital[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [platformStats, setPlatformStats] = useState<any>({
    totalDoctors: 8,
    totalHospitals: 4,
    totalAppointments: 140,
    satisfactionRate: "99.2%",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [docRes, hospRes, statsRes] = await Promise.all([
          doctorService.getDoctors({ sort: "rating" }),
          hospitalService.getHospitals(),
          statsService.getPlatformStats(),
        ]);
        if (docRes.success) setFeaturedDoctors(docRes.doctors.slice(0, 3));
        if (hospRes.success) setFeaturedHospitals(hospRes.hospitals.slice(0, 2));
        if (statsRes.success) setPlatformStats(statsRes.stats);
      } catch (err) {
        console.error("Failed to load landing data:", err);
      }
    };
    loadData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/doctors?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/doctors");
    }
  };

  const handleDemoLogin = async (role: "patient" | "doctor") => {
    await loginAsDemo(role);
    if (role === "doctor") {
      navigate("/doctor/dashboard");
    } else {
      navigate("/feed");
    }
  };

  const specialties = [
    { name: "Cardiology", icon: "❤️", desc: "Heart & Vascular", count: "14+ Doctors" },
    { name: "Dermatology", icon: "✨", desc: "Skin & Cosmetics", count: "9+ Doctors" },
    { name: "Pediatrics", icon: "🧸", desc: "Child Wellness", count: "12+ Doctors" },
    { name: "Neurology", icon: "🧠", desc: "Brain & Spine", count: "8+ Doctors" },
    { name: "Orthopedics", icon: "🦴", desc: "Bones & Joints", count: "11+ Doctors" },
    { name: "Oncology", icon: "🔬", desc: "Cancer Care", count: "7+ Doctors" },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative pt-8 sm:pt-14 pb-12 overflow-hidden">
        {/* Background glow decorations */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[600px] h-96 sm:h-[500px] bg-gradient-to-tr from-teal-400/20 to-sky-400/20 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-bold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-teal-500 animate-spin" />
            <span>Discover Verified Medical Specialists & Premier Hospitals</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display max-w-4xl mx-auto leading-tight sm:leading-none">
            Your Health, Connected with <span className="gradient-text">Expert Care.</span>
          </h1>

          {/* Subtext */}
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Discover verified doctors, watch clinician-led health reels, explore top hospitals, and book in-person or instant HD video appointments in seconds.
          </p>

          {/* Global Search Bar */}
          <div className="max-w-2xl mx-auto">
            <form
              onSubmit={handleSearch}
              className="p-2 sm:p-2.5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xl flex flex-col sm:flex-row gap-2"
            >
              <div className="flex-1 flex items-center px-3 gap-2">
                <Search className="w-5 h-5 text-teal-600 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search doctor name, specialty, hospital, or city..."
                  className="w-full bg-transparent text-sm text-slate-800 dark:text-white outline-none placeholder:text-slate-400"
                />
              </div>

              <button
                type="submit"
                className="btn-primary !py-3 !px-6 !text-sm flex items-center justify-center gap-2 shrink-0"
              >
                <span>Find Doctors</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Quick Demo 1-Click Login Cards */}
          <div className="pt-2 max-w-xl mx-auto">
            <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                ⚡ Instant 1-Click Demo Showcase
              </div>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={() => handleDemoLogin("patient")}
                  className="flex-1 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-teal-200 dark:border-teal-800/80 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-left flex items-center space-x-2.5 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-xs">
                    SJ
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Patient Demo</div>
                    <div className="text-[10px] text-slate-500">patient@test.com</div>
                  </div>
                </button>

                <button
                  onClick={() => handleDemoLogin("doctor")}
                  className="flex-1 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-sky-200 dark:border-sky-800/80 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-left flex items-center space-x-2.5 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold text-xs">
                    MD
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Doctor Demo</div>
                    <div className="text-[10px] text-slate-500">doctor@test.com</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights / Stats Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="card-health p-5 text-center space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-teal-600 dark:text-teal-400 font-display">
              {platformStats.totalDoctors}+
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
              Verified Doctors
            </div>
            <div className="text-[11px] text-slate-400">Board-certified specialists</div>
          </div>

          <div className="card-health p-5 text-center space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-sky-600 dark:text-sky-400 font-display">
              {platformStats.totalHospitals}+
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
              Partner Hospitals
            </div>
            <div className="text-[11px] text-slate-400">Equipped with 24/7 Trauma</div>
          </div>

          <div className="card-health p-5 text-center space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 font-display">
              99.2%
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
              Patient Satisfaction
            </div>
            <div className="text-[11px] text-slate-400">Over 12,000+ consults</div>
          </div>

          <div className="card-health p-5 text-center space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-teal-600 dark:text-teal-400 font-display">
              24/7
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
              Video Telehealth
            </div>
            <div className="text-[11px] text-slate-400">Instant HD consultations</div>
          </div>
        </div>
      </section>

      {/* Specialties Directory Carousel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Clinical Fields
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display mt-1">
              Browse by Medical Specialty
            </h2>
          </div>
          <Link
            to="/doctors"
            className="text-xs sm:text-sm font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
          >
            <span>All Specialties</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {specialties.map((spec) => (
            <Link
              key={spec.name}
              to={`/doctors?specialty=${spec.name}`}
              className="card-health p-4 text-center group hover:border-teal-500 hover:scale-105 transition-all"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                {spec.icon}
              </div>
              <div className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400">
                {spec.name}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">{spec.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Doctors */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Verified Physicians
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display mt-1">
              Top Rated Doctors
            </h2>
          </div>
          <Link
            to="/doctors"
            className="text-xs sm:text-sm font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
          >
            <span>View All Doctors</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredDoctors.map((doc) => (
            <DoctorCard key={doc._id} doctor={doc} />
          ))}
        </div>
      </section>

      {/* Social Health Reels & Knowledge Teaser Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold">
              <Video className="w-3.5 h-3.5 text-teal-300" />
              <span>Doctor-Created Health Reels & Articles</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display leading-tight">
              Evidence-based health tips straight from practicing doctors.
            </h2>
            <p className="text-sm text-teal-100 leading-relaxed">
              Explore bite-sized video reels, clinical breakdown articles, hypertension management routines, skincare advice, and pediatric guidelines.
            </p>
            <div className="pt-2">
              <Link to="/feed" className="btn-secondary !py-3 !px-6 !text-sm">
                <span>Explore Health Feed & Reels</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Top Hospitals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Medical Centers
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display mt-1">
              Partner Hospitals
            </h2>
          </div>
          <Link
            to="/hospitals"
            className="text-xs sm:text-sm font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
          >
            <span>All Hospitals</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredHospitals.map((hosp) => (
            <HospitalCard key={hosp._id} hospital={hosp} />
          ))}
        </div>
      </section>
    </div>
  );
};
