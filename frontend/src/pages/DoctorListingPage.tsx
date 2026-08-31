import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { doctorService } from "../services/doctorService";
import { Doctor } from "../types";
import { DoctorCard } from "../components/doctor/DoctorCard";
import { SkeletonCard } from "../components/common/SkeletonLoader";
import {
  Search,
  Filter,
  SlidersHorizontal,
  Stethoscope,
  MapPin,
  Star,
  DollarSign,
  Sparkles,
} from "lucide-react";

export const DoctorListingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [specialties, setSpecialties] = useState<string[]>(["All"]);

  const [search, setSearch] = useState<string>(searchParams.get("search") || "");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>(
    searchParams.get("specialty") || "All"
  );
  const [selectedCity, setSelectedCity] = useState<string>("All");
  const [sortOption, setSortOption] = useState<string>("rating");

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const res = await doctorService.getSpecialties();
        if (res.success) setSpecialties(res.specialties);
      } catch (err) {
        console.error("Failed to load specialties:", err);
      }
    };
    fetchSpecialties();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await doctorService.getDoctors({
        search: search.trim() || undefined,
        specialty: selectedSpecialty !== "All" ? selectedSpecialty : undefined,
        city: selectedCity !== "All" ? selectedCity : undefined,
        sort: sortOption,
      });
      if (res.success) setDoctors(res.doctors);
    } catch (err) {
      console.error("Failed to fetch doctors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialty, selectedCity, sortOption]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDoctors();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-bold mb-2 border border-teal-200 dark:border-teal-800">
          <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
          <span>Verified Healthcare Specialists</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
          Find & Book Top Doctors
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Browse verified physicians, check consultation fees and hospital affiliations, and schedule visits.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="card-health p-4 sm:p-5 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by doctor name, specialty, condition, or hospital..."
              className="input-health !pl-10 text-xs"
            />
          </div>

          <button type="submit" className="btn-primary !py-2.5 !px-5 !text-xs shrink-0">
            Search Doctors
          </button>
        </form>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Specialty
            </label>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="input-health text-xs !py-2"
            >
              {specialties.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Location / City
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="input-health text-xs !py-2"
            >
              <option value="All">All Cities</option>
              <option value="New York">New York, NY</option>
              <option value="Boston">Boston, MA</option>
              <option value="Los Angeles">Los Angeles, CA</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Sort By
            </label>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="input-health text-xs !py-2"
            >
              <option value="rating">Highest Rated</option>
              <option value="fee_low">Consultation Fee: Low to High</option>
              <option value="fee_high">Consultation Fee: High to Low</option>
              <option value="experience">Most Experienced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Doctor Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : doctors.length === 0 ? (
        <div className="card-health p-12 text-center text-slate-500 space-y-3">
          <Stethoscope className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="font-semibold text-sm">No doctors match your selected filters.</p>
          <button
            onClick={() => {
              setSelectedSpecialty("All");
              setSelectedCity("All");
              setSearch("");
            }}
            className="btn-outline !py-2 !px-4 !text-xs"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-xs font-bold text-slate-500">
            Showing {doctors.length} verified physicians
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <DoctorCard key={doctor._id} doctor={doctor} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};