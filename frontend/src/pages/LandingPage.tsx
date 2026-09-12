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
  Lock,
  Compass,
  FileText,
  UserCheck,
  Zap,
  PhoneCall,
  LayoutDashboard,
  PlusCircle,
  HelpCircle,
  Award,
  Layers,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";

export const LandingPage: React.FC = () => {
  const { loginAsDemo, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Data states for authenticated dashboard
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
        const statsRes = await statsService.getPlatformStats();
        if (statsRes.success) setPlatformStats(statsRes.stats);

        // If authenticated, also load doctor & hospital previews
        if (isAuthenticated) {
          const [docRes, hospRes] = await Promise.all([
            doctorService.getDoctors({ sort: "rating" }),
            hospitalService.getHospitals(),
          ]);
          if (docRes.success) setFeaturedDoctors(docRes.doctors.slice(0, 3));
          if (hospRes.success) setFeaturedHospitals(hospRes.hospitals.slice(0, 2));
        }
      } catch (err) {
        console.error("Failed to load landing data:", err);
      }
    };
    loadData();
  }, [isAuthenticated]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          message: "Please sign in or register to search and book doctors.",
          from: { pathname: "/doctors", search: searchQuery.trim() ? `?search=${encodeURIComponent(searchQuery.trim())}` : "" },
        },
      });
      return;
    }

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
    { name: "Cardiology", icon: "❤️", desc: "Heart & Vascular Care", count: "14+ Doctors" },
    { name: "Dermatology", icon: "✨", desc: "Skin & Aesthetics", count: "9+ Doctors" },
    { name: "Pediatrics", icon: "🧸", desc: "Child Health & Wellness", count: "12+ Doctors" },
    { name: "Neurology", icon: "🧠", desc: "Brain & Nervous System", count: "8+ Doctors" },
    { name: "Orthopedics", icon: "🦴", desc: "Bones, Joints & Trauma", count: "11+ Doctors" },
    { name: "Oncology", icon: "🔬", desc: "Cancer Care & Research", count: "7+ Doctors" },
  ];

  const coreFeatures = [
    {
      icon: Stethoscope,
      title: "Verified Specialist Directory",
      badge: "Clinical Excellence",
      color: "from-teal-500 to-emerald-600",
      targetPath: "/doctors",
      description:
        "Search and filter board-certified medical doctors across 30+ disciplines. Inspect credentials, experience, consultation fees, and real patient reviews.",
      benefit: "Direct access to top-rated physicians without waiting in line",
    },
    {
      icon: Video,
      title: "Clinician Health Feed & Reels",
      badge: "Doctor-Created Media",
      color: "from-sky-500 to-blue-600",
      targetPath: "/feed",
      description:
        "Watch bite-sized video reels and read in-depth articles published directly by practicing clinicians on nutrition, skin routines, and preventative health.",
      benefit: "100% peer-reviewed medical insights, free of misinformation",
    },
    {
      icon: Building2,
      title: "Partner Hospital Network",
      badge: "24/7 Trauma Centers",
      color: "from-indigo-500 to-purple-600",
      targetPath: "/hospitals",
      description:
        "Explore premier accredited hospital networks equipped with intensive care units, MRI diagnostics, surgical centers, and emergency helplines.",
      benefit: "Find the best multi-specialty medical facility near you",
    },
    {
      icon: Calendar,
      title: "Smart Telehealth & In-Person Booking",
      badge: "Instant Scheduling",
      color: "from-amber-500 to-orange-600",
      targetPath: "/doctors",
      description:
        "Book physical clinic visits or start high-definition encrypted video appointments directly from your phone or browser with real-time slot selection.",
      benefit: "Zero paperwork with automated appointment reminders",
    },
    {
      icon: PlusCircle,
      title: "Doctor Practice Studio",
      badge: "Clinician Portal",
      color: "from-rose-500 to-pink-600",
      targetPath: "/doctor/dashboard",
      description:
        "Dedicated workspace for healthcare providers to manage patient schedules, write prescriptions, review consultation history, and publish clinical content.",
      benefit: "Streamlined workflow for medical practitioners",
    },
    {
      icon: ShieldCheck,
      title: "HIPAA Compliant & Secure Records",
      badge: "Patient Data Safety",
      color: "from-emerald-500 to-teal-700",
      targetPath: "/feed",
      description:
        "Enterprise-grade 256-bit encryption protecting patient consultation records, digital prescriptions, and private communication.",
      benefit: "Your health records are confidential and strictly protected",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Create Your Account",
      desc: "Sign up in 30 seconds as a patient seeking care, or register as a medical doctor to manage your clinic practice.",
      icon: UserCheck,
    },
    {
      number: "02",
      title: "Discover Specialists & Reels",
      desc: "Filter top specialists by specialty, fees, or location, and explore doctor-led medical video reels in the Health Feed.",
      icon: Compass,
    },
    {
      number: "03",
      title: "Book In-Person or Video Visit",
      desc: "Pick an available date and time slot for a clinic visit or instant HD video telehealth consultation with secure confirmation.",
      icon: Calendar,
    },
    {
      number: "04",
      title: "Receive Comprehensive Care",
      desc: "Connect with your doctor, receive diagnosis and digital prescriptions, and track your ongoing wellness progress.",
      icon: HeartPulse,
    },
  ];

  const testimonials = [
    {
      quote:
        "CuraPulse revolutionized how I manage cardiology consultations. The video quality is flawless and patient scheduling is completely automated.",
      author: "Dr. Marcus Wright, MD",
      role: "Lead Cardiologist, Metropolitan Heart Institute",
      rating: 5,
    },
    {
      quote:
        "Booking an appointment for my daughter took less than 2 minutes. The health reels created by verified pediatricians gave us huge peace of mind!",
      author: "Sarah Jenkins",
      role: "Patient & Health Enthusiast",
      rating: 5,
    },
    {
      quote:
        "Finding an emergency hospital with an active ICU slot during an urgent situation was seamless with CuraPulse's hospital network directory.",
      author: "David Chen",
      role: "Patient Caregiver",
      rating: 5,
    },
  ];

  /* ------------------------------------------------------------------------- */
  /* GUEST / UNAUTHENTICATED PRODUCT SHOWCASE MODE                             */
  /* ------------------------------------------------------------------------- */
  if (!isAuthenticated) {
    return (
      <div className="space-y-20 sm:space-y-28 pb-24">
        {/* Hero Section */}
        <section className="relative pt-10 sm:pt-16 pb-12 overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[650px] h-96 sm:h-[550px] bg-gradient-to-tr from-teal-400/20 via-sky-400/20 to-indigo-400/15 rounded-full blur-3xl -z-10 pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-bold shadow-sm">
              <Sparkles className="w-4 h-4 text-teal-500 animate-spin" />
              <span>Next-Generation Integrated Healthcare Ecosystem</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display max-w-4xl mx-auto leading-tight sm:leading-[1.1]">
              The Complete Healthcare Platform for{" "}
              <span className="gradient-text">Patients & Clinicians.</span>
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Connect with board-certified medical specialists, explore peer-reviewed health video reels, discover leading partner hospitals, and book seamless in-person or HD telehealth consultations.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2 max-w-md mx-auto">
              <Link
                to="/register"
                className="w-full sm:w-auto btn-primary !py-3.5 !px-8 !text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25"
              >
                <span>Get Started - Sign Up Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto btn-secondary !py-3.5 !px-8 !text-sm flex items-center justify-center gap-2"
              >
                <span>Sign In to Access</span>
                <Lock className="w-4 h-4" />
              </Link>
            </div>

            {/* Informational Prompt Alert */}
            <div className="max-w-xl mx-auto p-3 rounded-xl bg-slate-100/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
              <span>
                <strong>Login Required:</strong> Create a free account or sign in to browse doctor schedules, view health reels, and book visits.
              </span>
            </div>

            {/* 1-Click Demo Quick Showcase */}
            <div className="pt-4 max-w-xl mx-auto">
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-md">
                <div className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-3 flex items-center justify-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  <span>Instant 1-Click Demo Access</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => handleDemoLogin("patient")}
                    className="p-3 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-left flex items-center space-x-3 transition-all group"
                  >
                    <div className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow">
                      SJ
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 flex items-center justify-between">
                        <span>Patient Demo</span>
                        <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">patient@test.com</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleDemoLogin("doctor")}
                    className="p-3 rounded-xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-left flex items-center space-x-3 transition-all group"
                  >
                    <div className="w-9 h-9 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs shadow">
                      MD
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 flex items-center justify-between">
                        <span>Doctor Demo</span>
                        <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">doctor@test.com</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Stats Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="card-health p-6 text-center space-y-1.5 border border-slate-200/80 dark:border-slate-800">
              <div className="text-3xl sm:text-4xl font-extrabold text-teal-600 dark:text-teal-400 font-display">
                {platformStats.totalDoctors}+
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                Verified Specialists
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Board-certified clinical doctors
              </div>
            </div>

            <div className="card-health p-6 text-center space-y-1.5 border border-slate-200/80 dark:border-slate-800">
              <div className="text-3xl sm:text-4xl font-extrabold text-sky-600 dark:text-sky-400 font-display">
                {platformStats.totalHospitals}+
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                Partner Hospitals
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                24/7 ICUs & Trauma Centers
              </div>
            </div>

            <div className="card-health p-6 text-center space-y-1.5 border border-slate-200/80 dark:border-slate-800">
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 font-display">
                {platformStats.satisfactionRate || "99.2%"}
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                Care Satisfaction
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                From 12,000+ patient consults
              </div>
            </div>

            <div className="card-health p-6 text-center space-y-1.5 border border-slate-200/80 dark:border-slate-800">
              <div className="text-3xl sm:text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 font-display">
                24/7
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                Telehealth Ready
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Instant HD encrypted video calls
              </div>
            </div>
          </div>
        </section>

        {/* Core Features Showcase Section */}
        <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Complete Healthcare Suite
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-display">
              Everything You Need for Modern Medical Care
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              CuraPulse unifies patient discovery, clinician social health education, hospital networks, and instant booking into one secure, seamless platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {coreFeatures.map((feat, idx) => {
              const IconComp = feat.icon;
              return (
                <Link
                  key={idx}
                  to="/login"
                  state={{
                    message: `Please sign in or create an account to access the ${feat.title}.`,
                    from: { pathname: feat.targetPath || "/feed" },
                  }}
                  className="card-health p-6 sm:p-7 flex flex-col justify-between space-y-4 hover:border-teal-500 hover:scale-[1.03] hover:shadow-2xl transition-all group cursor-pointer"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${feat.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                        <IconComp className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-teal-50 dark:group-hover:bg-teal-950/60 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                        {feat.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {feat.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      {feat.benefit}
                    </span>
                    <span className="text-teal-600 dark:text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Simple & Transparent
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-display">
              How CuraPulse Works in 4 Steps
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              From your initial sign-up to post-consultation follow-up, medical care is seamless.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, idx) => {
              const IconComp = step.icon;
              return (
                <div
                  key={idx}
                  className="card-health p-6 space-y-4 relative overflow-hidden border border-slate-200/80 dark:border-slate-800"
                >
                  <div className="text-4xl font-black text-teal-600/15 dark:text-teal-400/10 font-display absolute right-4 top-4 select-none">
                    {step.number}
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {step.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Clinical Specialties Preview Section */}
        <section id="specialties" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Medical Expertise
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display mt-1">
                Browse by Medical Specialty
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Over 30+ medical departments available with verified board certifications.
              </p>
            </div>
            <Link
              to="/login"
              state={{ message: "Sign in to browse all specialized doctors and hospital departments." }}
              className="text-xs sm:text-sm font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Sign In to View All</span>
              <Lock className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {specialties.map((spec) => (
              <Link
                key={spec.name}
                to="/login"
                state={{
                  message: `Please sign in to browse ${spec.name} doctors and book appointments.`,
                  from: { pathname: "/doctors", search: `?specialty=${spec.name}` },
                }}
                className="card-health p-4 text-center group hover:border-teal-500 hover:scale-105 transition-all cursor-pointer"
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

        {/* Clinician Health Reels Teaser Banner */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-teal-800 via-teal-900 to-slate-950 p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10 max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold text-teal-200">
                <Video className="w-3.5 h-3.5 text-teal-300" />
                <span>Clinician-Led Health Reels & Articles</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-display leading-tight">
                Peer-reviewed health insights directly from practicing doctors.
              </h2>
              <p className="text-sm text-teal-100 leading-relaxed">
                Watch doctor-created video reels on hypertension management, skincare, child nutrition, and mental health routines. Available exclusively inside the CuraPulse Health Feed.
              </p>
              <div className="pt-3 flex flex-wrap gap-3">
                <Link
                  to="/login"
                  state={{
                    message: "Please sign in to access the Clinician Health Feed & Video Reels.",
                    from: { pathname: "/feed" },
                  }}
                  className="btn-secondary !py-3 !px-6 !text-sm flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Sign In to Watch Reels</span>
                </Link>
                <Link to="/register" className="btn-primary !py-3 !px-6 !text-sm">
                  <span>Register Free</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Trust, Security & Compliance */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-10 rounded-3xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 mx-auto flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                HIPAA & Data Privacy
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                End-to-end encrypted consultations with compliance to healthcare privacy standards.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 mx-auto flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                100% Verified Physicians
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Every doctor undergoes manual medical license verification and clinical screening.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Instant Video Scheduling
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Real-time doctor calendar sync with instant video conferencing links and reminders.
              </p>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Trusted by Thousands
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
              Loved by Patients & Doctors Alike
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((test, idx) => (
              <div
                key={idx}
                className="card-health p-6 space-y-4 flex flex-col justify-between border border-slate-200/80 dark:border-slate-800"
              >
                <div className="space-y-3">
                  <div className="flex items-center space-x-1 text-amber-400">
                    {[...Array(test.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
                    "{test.quote}"
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="font-bold text-xs text-slate-900 dark:text-white">
                    {test.author}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {test.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 24/7 Helpline Anchor Section */}
        <section id="helpline" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 sm:p-8 rounded-3xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span>24/7 Medical Emergency Guidance</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-display">
                Need Immediate Emergency Care?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl">
                If you are facing a life-threatening crisis or trauma, call emergency services (911 / 112) or head to the nearest verified trauma center.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <a
                href="tel:911"
                className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 transition-all"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call Emergency: 911</span>
              </a>
              <Link
                to="/login"
                state={{ message: "Sign in to locate nearby partner hospitals and trauma facilities." }}
                className="px-6 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
              >
                <span>Find Trauma Centers</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Final Registration CTA */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-tr from-teal-600 via-teal-700 to-sky-600 text-white shadow-2xl space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black font-display leading-tight">
              Ready to Take Control of Your Health?
            </h2>
            <p className="text-sm sm:text-base text-teal-100 max-w-2xl mx-auto leading-relaxed">
              Join thousands of patients and licensed physicians on CuraPulse today. It's free to create an account.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-teal-700 hover:bg-teal-50 font-bold text-sm shadow transition-all flex items-center justify-center gap-2"
              >
                <span>Register Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-teal-800/80 hover:bg-teal-900 border border-teal-400/40 text-white font-bold text-sm shadow transition-all flex items-center justify-center gap-2"
              >
                <span>Sign In to Account</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  /* ------------------------------------------------------------------------- */
  /* AUTHENTICATED HEALTH HUB (FOR LOGGED-IN USERS)                             */
  /* ------------------------------------------------------------------------- */
  return (
    <div className="space-y-12 sm:space-y-16 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      {/* Personalized Welcome Banner */}
      <section className="p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-teal-200">
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            <span>Welcome Back, {user?.name}!</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold font-display leading-tight">
            What healthcare service can we help you find today?
          </h1>

          <p className="text-xs sm:text-sm text-teal-100 max-w-2xl leading-relaxed">
            Search verified specialists, explore newly uploaded medical reels from our clinical team, or view your appointments.
          </p>

          {/* Quick Search Input */}
          <form onSubmit={handleSearch} className="pt-2 max-w-2xl flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex items-center px-4 py-3 rounded-2xl bg-white text-slate-800 gap-2 shadow-lg">
              <Search className="w-5 h-5 text-teal-600 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search doctors by name, specialty, condition, or hospital..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              className="btn-primary !py-3 !px-6 !text-sm flex items-center justify-center gap-2 shrink-0 shadow-lg"
            >
              <span>Search Doctors</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Action Shortcuts */}
          <div className="pt-3 flex flex-wrap gap-2 text-xs font-semibold">
            {user?.role === "patient" ? (
              <>
                <Link
                  to="/feed"
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors flex items-center gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5 text-teal-300" />
                  <span>Health Reels & Feed</span>
                </Link>
                <Link
                  to="/my-appointments"
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5 text-teal-300" />
                  <span>My Appointments</span>
                </Link>
                <Link
                  to="/my-records"
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-teal-300" />
                  <span>Health Records & Rx</span>
                </Link>
                <Link
                  to="/hospitals"
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors flex items-center gap-1.5"
                >
                  <Building2 className="w-3.5 h-3.5 text-teal-300" />
                  <span>Partner Hospitals</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/doctor/dashboard"
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors flex items-center gap-1.5"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-sky-300" />
                  <span>Doctor Dashboard</span>
                </Link>
                <Link
                  to="/doctor/appointments"
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5 text-sky-300" />
                  <span>Patient Bookings</span>
                </Link>
                <Link
                  to="/doctor/content"
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-sky-300" />
                  <span>Publish Health Reel</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Specialties Directory Carousel */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Clinical Fields
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display mt-0.5">
              Browse by Medical Specialty
            </h2>
          </div>
          <Link
            to="/doctors"
            className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
          >
            <span>All Specialties</span>
            <ArrowRight className="w-3.5 h-3.5" />
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

      {/* Featured Doctors Section */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Top Specialists
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display mt-0.5">
              Top Rated Doctors
            </h2>
          </div>
          <Link
            to="/doctors"
            className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
          >
            <span>View All Doctors ({platformStats.totalDoctors})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredDoctors.map((doc) => (
            <DoctorCard key={doc._id} doctor={doc} />
          ))}
        </div>
      </section>

      {/* Health Reels Banner Teaser */}
      <section>
        <div className="rounded-3xl bg-gradient-to-r from-teal-800 via-teal-900 to-slate-950 p-6 sm:p-8 text-white relative overflow-hidden shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold text-teal-200">
              <Video className="w-3.5 h-3.5 text-teal-300" />
              <span>Doctor-Created Health Reels</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold font-display">
              Catch up on the latest medical reels & healthy habits.
            </h3>
            <p className="text-xs sm:text-sm text-teal-100">
              Evidence-based tips from practicing dermatologists, pediatricians, and cardiologists.
            </p>
          </div>
          <Link
            to="/feed"
            className="btn-secondary !py-3 !px-6 !text-sm flex items-center gap-2 shrink-0"
          >
            <Compass className="w-4 h-4" />
            <span>Open Health Feed</span>
          </Link>
        </div>
      </section>

      {/* Partner Hospitals Section */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Accredited Centers
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display mt-0.5">
              Partner Hospitals
            </h2>
          </div>
          <Link
            to="/hospitals"
            className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
          >
            <span>All Hospitals ({platformStats.totalHospitals})</span>
            <ArrowRight className="w-3.5 h-3.5" />
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
