import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { hospitalService } from "../services/hospitalService";
import { Hospital, Doctor } from "../types";
import { DoctorCard } from "../components/doctor/DoctorCard";
import { Badge } from "../components/common/Badge";
import {
  Building2,
  MapPin,
  Star,
  BedDouble,
  ShieldAlert,
  Phone,
  Mail,
  Globe,
  ArrowLeft,
  CheckCircle2,
  Stethoscope,
  Sparkles,
} from "lucide-react";

export const HospitalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [affiliatedDoctors, setAffiliatedDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await hospitalService.getHospitalById(id);
        if (res.success) {
          setHospital(res.hospital);
          setAffiliatedDoctors(res.doctors || []);
        }
      } catch (err) {
        console.error("Failed to load hospital:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Hospital Not Found</h2>
        <Link to="/hospitals" className="btn-primary !py-2 !px-4 !text-xs inline-flex">
          Return to Hospital Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link
        to="/hospitals"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Hospitals</span>
      </Link>

      {/* Hero Banner */}
      <div className="card-health overflow-hidden">
        <div className="relative h-64 sm:h-80 w-full bg-slate-900">
          <img
            src={hospital.image || "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=1200&auto=format&fit=crop&q=80"}
            alt={hospital.name}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

          {/* Overlaid Badges */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
            <div className="space-y-1.5">
              {hospital.emergencyAvailable && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-600/90 text-white text-[11px] font-bold shadow mb-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>24/7 Level 1 Trauma Care Active</span>
                </div>
              )}
              <h1 className="text-2xl sm:text-4xl font-extrabold font-display leading-tight">
                {hospital.name}
              </h1>
              <p className="text-xs sm:text-sm text-teal-300 font-medium">
                {hospital.tagline}
              </p>
            </div>

            {/* Rating pill */}
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-2xl flex items-center gap-1.5 shrink-0 shadow-lg">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span className="text-sm font-extrabold text-slate-800 dark:text-white">
                {hospital.rating.toFixed(1)}
              </span>
              <span className="text-xs text-slate-500">({hospital.reviewCount} reviews)</span>
            </div>
          </div>
        </div>

        {/* Quick Details Bar */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Address</div>
              <div className="font-semibold truncate">{hospital.address}, {hospital.city}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <BedDouble className="w-4 h-4 text-teal-600 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Total Inpatient Beds</div>
              <div className="font-semibold">{hospital.totalBeds} Active Beds</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-teal-600 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Direct Line</div>
              <div className="font-semibold">{hospital.phone || "+1 (212) 555-0199"}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-teal-600 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Official Portal</div>
              <a href={hospital.website} target="_blank" rel="noreferrer" className="font-semibold text-teal-600 hover:underline truncate block">
                {hospital.website || "Official Site"}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Info Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Overview and Facilities */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-health p-6 space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              About the Institution
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {hospital.description}
            </p>
          </div>

          <div className="card-health p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Medical Facilities & Advanced Equipment
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {hospital.facilities?.map((f, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Departments list */}
        <div className="space-y-6">
          <div className="card-health p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-teal-600" />
              <span>Clinical Departments</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {hospital.specialties?.map((spec, idx) => (
                <Link
                  key={idx}
                  to={`/doctors?specialty=${spec}`}
                  className="hover:scale-105 transition-transform"
                >
                  <Badge variant="primary" className="text-xs py-1 px-3">
                    {spec}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Affiliated Doctors Directory */}
      <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            Clinical Faculty
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display mt-1">
            Doctors Practicing at {hospital.name}
          </h2>
        </div>

        {affiliatedDoctors.length === 0 ? (
          <div className="card-health p-8 text-center text-slate-500">
            No specific doctors listed for this facility at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {affiliatedDoctors.map((doc) => (
              <DoctorCard key={doc._id} doctor={doc} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};