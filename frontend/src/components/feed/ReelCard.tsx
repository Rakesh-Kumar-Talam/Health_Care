import React, { useState } from "react";
import { Reel } from "../../types";
import { ReelPlayerModal } from "./ReelPlayerModal";
import {
  Play,
  Heart,
  Eye,
  Clock,
  CheckCircle2,
  Stethoscope,
} from "lucide-react";

interface ReelCardProps {
  reel: Reel;
  onReelUpdated?: (updated: Reel) => void;
}

export const ReelCard: React.FC<ReelCardProps> = ({ reel, onReelUpdated }) => {
  const [playerOpen, setPlayerOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setPlayerOpen(true)}
        className="relative group cursor-pointer rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 bg-slate-900 aspect-[9/14] flex flex-col justify-between p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
      >
        {/* Background Thumbnail Image */}
        <img
          src={reel.thumbnail || "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80"}
          alt={reel.title}
          className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-slate-950/40"></div>

        {/* Top Badges */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="text-[10px] uppercase font-extrabold tracking-wider bg-teal-600/90 backdrop-blur-md text-white px-2 py-0.5 rounded-full shadow">
            {reel.category || "Health Tip"}
          </span>

          <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3 text-teal-400" />
            <span>{reel.duration}</span>
          </div>
        </div>

        {/* Center Play Button Overlay */}
        <div className="relative z-10 self-center w-12 h-12 rounded-full bg-white/30 backdrop-blur-md border border-white/40 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-teal-500 transition-all duration-300 shadow-xl">
          <Play className="w-5 h-5 fill-white ml-0.5" />
        </div>

        {/* Bottom Details & Author */}
        <div className="relative z-10 space-y-2">
          {/* Doctor Info Pill */}
          <div className="flex items-center space-x-2">
            <img
              src={reel.doctorAvatar || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=80&auto=format&fit=crop&q=80"}
              alt={reel.doctorName}
              className="w-7 h-7 rounded-full object-cover border border-white/80 shadow"
            />
            <div className="flex items-center gap-1 text-white text-xs font-bold truncate drop-shadow-sm">
              <span className="truncate">{reel.doctorName}</span>
              <CheckCircle2 className="w-3 h-3 text-teal-400 fill-teal-400/20 shrink-0" />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-white text-xs sm:text-sm font-bold line-clamp-2 leading-snug drop-shadow-md">
            {reel.title}
          </h3>

          {/* Metrics */}
          <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1 border-t border-white/10">
            <div className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-teal-400" />
              <span>{reel.viewsCount || 340} views</span>
            </div>
            <div className="flex items-center gap-1 text-rose-400">
              <Heart className="w-3.5 h-3.5 fill-rose-400" />
              <span>{reel.likesCount || 12}</span>
            </div>
          </div>
        </div>
      </div>

      {playerOpen && (
        <ReelPlayerModal
          reel={reel}
          onClose={() => setPlayerOpen(false)}
        />
      )}
    </>
  );
};
