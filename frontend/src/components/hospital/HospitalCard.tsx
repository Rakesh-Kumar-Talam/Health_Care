import React from "react";
import { Link } from "react-router-dom";
import { Hospital } from "../../types";
import { Badge } from "../common/Badge";
import {
  Building2,
  MapPin,
  Star,
  Activity,
  BedDouble,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";

interface HospitalCardProps {
  hospital: Hospital;
}

export const HospitalCard: React.FC<HospitalCardProps> = ({ hospital }) => {
  return (
    <div className="card-health overflow-hidden flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300">
      <div>
        {/* Hospital Image Banner */}
        <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img
            src={hospital.image || "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&auto=format&fit=crop&q=80"}
            alt={hospital.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Emergency 24/7 Badge */}
          {hospital.emergencyAvailable && (
            <div className="absolute top-3 left-3 bg-red-600/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-md">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>24/7 Trauma / Emergency</span>
            </div>
          )}

          {/* Rating Pill */}
          <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <span className="text-xs font-bold text-slate-800 dark:text-white">
              {hospital.rating.toFixed(1)}
            </span>
            <span className="text-[10px] text-slate-400">({hospital.reviewCount})</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5">
          <Link
            to={`/hospitals/${hospital._id}`}
            className="text-lg font-bold text-slate-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 transition-colors line-clamp-1"
          >
            {hospital.name}
          </Link>
          <p className="text-xs text-teal-600 dark:text-teal-400 font-medium mt-0.5">
            {hospital.tagline}
          </p>

          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span className="truncate">{hospital.address}, {hospital.city}, {hospital.state}</span>
          </div>

          {/* Capacity and Stats */}
          <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <BedDouble className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span><strong>{hospital.totalBeds}</strong> Inpatient Beds</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Est. {hospital.establishedYear}
            </div>
          </div>

          {/* Specialties Pills */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {hospital.specialties.slice(0, 3).map((spec, idx) => (
              <Badge key={idx} variant="secondary" className="text-[10px]">
                {spec}
              </Badge>
            ))}
            {hospital.specialties.length > 3 && (
              <span className="text-[10px] text-slate-400 self-center">
                +{hospital.specialties.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="p-5 pt-0">
        <Link
          to={`/hospitals/${hospital._id}`}
          className="w-full btn-outline !py-2.5 !text-xs flex items-center justify-center gap-2 group-hover:bg-teal-600 group-hover:text-white group-hover:border-teal-600 transition-all"
        >
          <span>Explore Hospital & Doctors</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
