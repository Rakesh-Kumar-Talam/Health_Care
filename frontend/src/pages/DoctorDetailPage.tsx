import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doctorService } from "../services/doctorService";
import { Doctor, Post, Reel } from "../types";
import { Badge } from "../components/common/Badge";
import { BookingModal } from "../components/appointment/BookingModal";
import { PostCard } from "../components/feed/PostCard";
import { ReelCard } from "../components/feed/ReelCard";
import {
  Stethoscope,
  Building2,
  MapPin,
  Star,
  CheckCircle2,
  Calendar,
  Clock,
  DollarSign,
  Globe,
  Award,
  BookOpen,
  Film,
  ArrowLeft,
  Share2,
} from "lucide-react";

export const DoctorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"about" | "posts" | "reels">("about");
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await doctorService.getDoctorById(id);
        if (res.success) {
          setDoctor(res.doctor);
          setPosts(res.posts || []);
          setReels(res.reels || []);
        }
      } catch (err) {
        console.error("Failed to load doctor:", err);
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

  if (!doctor) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Doctor Not Found</h2>
        <Link to="/doctors" className="btn-primary !py-2 !px-4 !text-xs inline-flex">
          Return to Doctor Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back navigation */}
      <Link
        to="/doctors"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Doctors Directory</span>
      </Link>

      {/* Main Profile Header Card */}
      <div className="card-health p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="relative">
              <img
                src={doctor.avatar || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80"}
                alt={doctor.name}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-teal-500/30 shadow-xl"
              />
              {doctor.isVerified && (
                <div className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-900 rounded-full p-1 shadow-md">
                  <CheckCircle2 className="w-6 h-6 text-teal-600 dark:text-teal-400 fill-teal-100 dark:fill-teal-950" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
                  {doctor.name}
                </h1>
              </div>

              <div className="text-sm font-bold text-teal-600 dark:text-teal-400">
                {doctor.specialty} Specialist
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>{doctor.hospitalName}</span>
                <span>•</span>
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{doctor.location.city}, {doctor.location.state}</span>
              </div>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-3 pt-1">
                <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 px-2.5 py-1 rounded-xl">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                  <span className="text-xs font-extrabold text-amber-900 dark:text-amber-300">
                    {doctor.rating.toFixed(1)}
                  </span>
                  <span className="text-[11px] text-slate-400">({doctor.reviewCount} reviews)</span>
                </div>

                <div className="text-xs text-slate-500 font-semibold">
                  {doctor.experienceYears}+ years experience
                </div>
              </div>
            </div>
          </div>

          {/* Right Action Panel */}
          <div className="w-full md:w-auto p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 shrink-0">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Consultation Fee
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                ${doctor.consultationFee}
              </div>
            </div>

            <button
              onClick={() => setBookingModalOpen(true)}
              className="btn-primary w-full !py-3 !px-6 !text-xs flex items-center justify-center gap-2 shadow-lg"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-4">
          <button
            onClick={() => setActiveTab("about")}
            className={`pb-2 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === "about"
                ? "border-teal-500 text-teal-600 dark:text-teal-400"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Doctor Overview & Credentials
          </button>

          <button
            onClick={() => setActiveTab("posts")}
            className={`pb-2 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === "posts"
                ? "border-teal-500 text-teal-600 dark:text-teal-400"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Articles & Advice ({posts.length})
          </button>

          <button
            onClick={() => setActiveTab("reels")}
            className={`pb-2 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === "reels"
                ? "border-teal-500 text-teal-600 dark:text-teal-400"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Health Reels ({reels.length})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "about" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Bio & Services */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card-health p-6 space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-teal-600" />
                <span>About {doctor.name}</span>
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {doctor.about || doctor.bio}
              </p>
            </div>

            <div className="card-health p-6 space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-600" />
                <span>Clinical Services & Procedures</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {doctor.services?.map((serv, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>{serv}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Schedule & Clinic details */}
          <div className="space-y-6">
            <div className="card-health p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600" />
                <span>Available Consultation Days</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {doctor.availableDays?.map((d, idx) => (
                  <Badge key={idx} variant="primary" className="text-xs">
                    {d}
                  </Badge>
                ))}
              </div>

              <div className="pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Typical Daily Slots
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {doctor.timeSlots?.map((slot, idx) => (
                    <div
                      key={idx}
                      className="text-center p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300"
                    >
                      {slot}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card-health p-6 space-y-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-teal-600" />
                <span>Languages Spoken</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {doctor.languages?.map((lang, idx) => (
                  <Badge key={idx} variant="neutral" className="text-xs">
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "posts" && (
        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="card-health p-12 text-center text-slate-500">
              This doctor has not published any clinical articles yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "reels" && (
        <div className="space-y-6">
          {reels.length === 0 ? (
            <div className="card-health p-12 text-center text-slate-500">
              This doctor has not posted any video reels yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {reels.map((reel) => (
                <ReelCard key={reel._id} reel={reel} />
              ))}
            </div>
          )}
        </div>
      )}

      {bookingModalOpen && (
        <BookingModal
          doctor={doctor}
          onClose={() => setBookingModalOpen(false)}
          onSuccess={() => setBookingModalOpen(false)}
        />
      )}
    </div>
  );
};