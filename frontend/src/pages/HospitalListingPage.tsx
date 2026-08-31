import React, { useEffect, useState } from "react";
import { hospitalService } from "../services/hospitalService";
import { Hospital } from "../types";
import { HospitalCard } from "../components/hospital/HospitalCard";
import { SkeletonCard } from "../components/common/SkeletonLoader";
import {
  Building2,
  Search,
  MapPin,
  ShieldAlert,
  SlidersHorizontal,
} from "lucide-react";

export const HospitalListingPage: React.FC = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("All");
  const [emergencyOnly, setEmergencyOnly] = useState<boolean>(false);

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const res = await hospitalService.getHospitals({
        search: search.trim() || undefined,
        city: selectedCity !== "All" ? selectedCity : undefined,
        emergencyOnly: emergencyOnly ? "true" : undefined,
      });
      if (res.success) setHospitals(res.hospitals);
    } catch (err) {
      console.error("Failed to fetch hospitals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, [selectedCity, emergencyOnly]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHospitals();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-bold mb-2 border border-teal-200 dark:border-teal-800">
          <Building2 className="w-3.5 h-3.5 text-teal-600" />
          <span>Accredited Medical Centers & Hospitals</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
          Hospital & Medical Center Directory
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Explore premier hospital networks, trauma facilities, surgical capabilities, and affiliated clinicians.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="card-health p-5 space-y-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search hospitals by name, specialty, or description..."
              className="input-health !pl-10 text-xs"
            />
          </div>

          <button type="submit" className="btn-primary !py-2.5 !px-5 !text-xs shrink-0">
            Search Hospitals
          </button>
        </form>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <label className="text-xs font-bold text-slate-500">City:</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="input-health text-xs !py-1.5 !px-3 w-40"
            >
              <option value="All">All Locations</option>
              <option value="New York">New York, NY</option>
              <option value="Boston">Boston, MA</option>
              <option value="Los Angeles">Los Angeles, CA</option>
            </select>
          </div>

          <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={emergencyOnly}
              onChange={(e) => setEmergencyOnly(e.target.checked)}
              className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
            />
            <span className="flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
              <span>24/7 Level 1 Trauma / Emergency Only</span>
            </span>
          </label>
        </div>
      </div>

      {/* Grid of Hospital Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : hospitals.length === 0 ? (
        <div className="card-health p-12 text-center text-slate-500">
          No hospitals found matching your search.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-xs font-bold text-slate-500">
            Showing {hospitals.length} healthcare facilities
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {hospitals.map((hospital) => (
              <HospitalCard key={hospital._id} hospital={hospital} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};