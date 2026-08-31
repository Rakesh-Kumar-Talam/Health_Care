import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Reel } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { reelService } from "../../services/reelService";
import {
  X,
  Heart,
  MessageCircle,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Send,
  CheckCircle2,
  Calendar,
  Share2,
} from "lucide-react";

interface ReelPlayerModalProps {
  reel: Reel;
  onClose: () => void;
}

export const ReelPlayerModal: React.FC<ReelPlayerModalProps> = ({ reel, onClose }) => {
  const { user, isAuthenticated } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [liked, setLiked] = useState<boolean>(() => {
    if (!user) return false;
    return reel.likes?.includes(user.id) || false;
  });
  const [likesCount, setLikesCount] = useState<number>(reel.likesCount || 0);
  const [comments, setComments] = useState(reel.comments || []);
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      alert("Please sign in or use demo login to like reels.");
      return;
    }

    try {
      const prevLiked = liked;
      setLiked(!prevLiked);
      setLikesCount((prev) => (prevLiked ? prev - 1 : prev + 1));

      const res = await reelService.toggleLike(reel._id);
      if (res.success) {
        setLiked(res.isLiked);
        setLikesCount(res.likesCount);
      }
    } catch (error) {
      console.error("Failed to like reel:", error);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert("Please sign in or use demo login to comment.");
      return;
    }
    if (!commentText.trim()) return;

    try {
      const res = await reelService.addComment(reel._id, commentText.trim());
      if (res.success) {
        setComments(res.comments);
        setCommentText("");
      }
    } catch (error) {
      console.error("Failed to comment on reel:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="bg-slate-900 rounded-3xl max-w-4xl w-full h-[90vh] max-h-[820px] shadow-2xl border border-slate-800 flex flex-col md:flex-row overflow-hidden relative">
        {/* Video Side (Vertical 9:16) */}
        <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            src={reel.videoUrl}
            poster={reel.thumbnail}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            onClick={togglePlay}
            className="w-full h-full object-contain cursor-pointer"
          />

          {/* Play/Pause Overlay indicator */}
          {!isPlaying && (
            <button
              onClick={togglePlay}
              className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white"
            >
              <Play className="w-8 h-8 fill-white ml-1" />
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={toggleMute}
            className="absolute top-4 left-4 p-2.5 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/80 transition-colors z-20"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-teal-400" />}
          </button>

          {/* Floating Action Bar on Mobile Video */}
          <div className="absolute bottom-6 right-4 flex flex-col items-center space-y-4 md:hidden z-20">
            <button onClick={handleLike} className="flex flex-col items-center text-white">
              <div className={`p-3 rounded-full bg-black/60 backdrop-blur-md ${liked ? "text-rose-500" : ""}`}>
                <Heart className={`w-6 h-6 ${liked ? "fill-rose-500" : ""}`} />
              </div>
              <span className="text-xs font-bold mt-1">{likesCount}</span>
            </button>

            <button onClick={() => setShowComments(!showComments)} className="flex flex-col items-center text-white">
              <div className="p-3 rounded-full bg-black/60 backdrop-blur-md">
                <MessageCircle className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold mt-1">{comments.length}</span>
            </button>
          </div>
        </div>

        {/* Info & Comments Side (Desktop Sidebar / Mobile Drawer) */}
        <div
          className={`w-full md:w-96 bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 flex flex-col justify-between ${
            showComments ? "block" : "hidden md:flex"
          }`}
        >
          {/* Doctor Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={reel.doctorAvatar}
                alt={reel.doctorName}
                className="w-11 h-11 rounded-full object-cover border-2 border-teal-500"
              />
              <div>
                <Link
                  to={`/doctors/${reel.doctorId}`}
                  onClick={onClose}
                  className="text-sm font-bold text-white hover:text-teal-400 flex items-center gap-1"
                >
                  <span>{reel.doctorName}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 fill-teal-400/20" />
                </Link>
                <p className="text-xs text-teal-400 font-semibold">{reel.doctorSpecialty}</p>
              </div>
            </div>

            <Link
              to={`/doctors/${reel.doctorId}`}
              onClick={onClose}
              className="btn-primary !py-1.5 !px-3 !text-xs flex items-center gap-1"
            >
              <Calendar className="w-3 h-3" />
              <span>Book</span>
            </Link>
          </div>

          {/* Reel Caption & Tags */}
          <div className="p-5 border-b border-slate-800/80 space-y-2">
            <h2 className="text-white font-bold text-sm leading-snug">{reel.title}</h2>
            <p className="text-slate-300 text-xs leading-relaxed">{reel.caption}</p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {reel.tags?.map((t, idx) => (
                <span key={idx} className="text-xs font-semibold text-teal-400">
                  #{t}
                </span>
              ))}
            </div>

            <div className="hidden md:flex items-center space-x-6 pt-3 text-xs text-slate-300">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 font-bold hover:text-rose-400 transition-colors ${
                  liked ? "text-rose-500" : ""
                }`}
              >
                <Heart className={`w-4 h-4 ${liked ? "fill-rose-500" : ""}`} />
                <span>{likesCount} Likes</span>
              </button>

              <div className="flex items-center gap-1.5 font-bold">
                <MessageCircle className="w-4 h-4 text-teal-400" />
                <span>{comments.length} Comments</span>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="flex-1 p-5 space-y-3 overflow-y-auto max-h-60 md:max-h-none">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Community Responses ({comments.length})
            </div>

            {comments.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No comments yet. Ask a question below!</p>
            ) : (
              comments.map((c, idx) => (
                <div key={idx} className="flex items-start space-x-2.5">
                  <img
                    src={c.userAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80"}
                    alt={c.userName}
                    className="w-6 h-6 rounded-full object-cover mt-0.5"
                  />
                  <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60 flex-1">
                    <div className="text-[11px] font-bold text-slate-200">{c.userName}</div>
                    <div className="text-xs text-slate-300 mt-0.5">{c.text}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Comment Form */}
          <form onSubmit={handleAddComment} className="p-4 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add your thoughts or question..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="btn-primary !py-2 !px-3 !text-xs"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
