import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Doctor } from "../../types";
import { Badge } from "../common/Badge";
import { BookingModal } from "../appointment/BookingModal";
import {
  Star,
  MapPin,
  Calendar,
  Building2,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";

interface DoctorCardProps {
  doctor: Doctor;
  onBookingSuccess?: (appointment: any) => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onBookingSuccess }) => {
  const [bookingOpen, setBookingOpen] = useState(false);

  return (
    <>
      <div className="card-health p-5 flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300">
        <div>
          {/* Top Row: Avatar + Verification + Rating */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center space-x-3.5">
              <div className="relative">
                <img
                  src={doctor.avatar || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80"}
                  alt={doctor.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-500/30 group-hover:border-teal-500 transition-colors shadow-sm"
                />
                {doctor.isVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 rounded-full p-0.5 shadow">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 fill-teal-100 dark:fill-teal-950" />
                  </div>
                )}
              </div>

              <div>
                <Link
                  to={`/doctors/${doctor._id}`}
                  className="text-base font-bold text-slate-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 transition-colors line-clamp-1"
                >
                  {doctor.name}
                </Link>
                <div className="text-xs font-semibold text-teal-600 dark:text-teal-400">
                  {doctor.specialty}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {doctor.experienceYears}+ years clinical experience
                </div>
              </div>
            </div>

            {/* Rating pill */}
            <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 px-2 py-1 rounded-xl shrink-0">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                {doctor.rating.toFixed(1)}
              </span>
              <span className="text-[10px] text-slate-400">({doctor.reviewCount})</span>
            </div>
          </div>

          {/* Hospital & Location */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{doctor.hospitalName}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{doctor.location.city}, {doctor.location.state}</span>
            </div>
          </div>

          {/* Qualifications and badges */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {doctor.qualifications.slice(0, 2).map((q, idx) => (
              <Badge key={idx} variant="neutral" className="text-[10px]">
                {q}
              </Badge>
            ))}
            <Badge variant="primary" className="text-[10px]">
              {doctor.availableDays.length} Days Available
            </Badge>
          </div>
        </div>

        {/* Bottom Price and Actions */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Consultation</span>
            <div className="text-lg font-extrabold text-slate-900 dark:text-white">
              ${doctor.consultationFee}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/doctors/${doctor._id}`}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-colors"
              title="View Doctor Details"
            >
              Profile
            </Link>

            <button
              onClick={() => setBookingOpen(true)}
              className="btn-primary !py-2.5 !px-3.5 !text-xs"
            >
              <span>Book</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {bookingOpen && (
        <BookingModal
          doctor={doctor}
          onClose={() => setBookingOpen(false)}
          onSuccess={(app) => {
            setBookingOpen(false);
            if (onBookingSuccess) onBookingSuccess(app);
          }}
        />
      )}
    </>
  );
};
