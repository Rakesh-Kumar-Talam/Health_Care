import React, { useState } from "react";
import { Reel } from "../../types";
import { reelService } from "../../services/reelService";
import { X, Video, Film, Send } from "lucide-react";

interface ReelEditorModalProps {
  reelToEdit?: Reel | null;
  onClose: () => void;
  onSaved: (reel: Reel) => void;
}

export const ReelEditorModal: React.FC<ReelEditorModalProps> = ({
  reelToEdit,
  onClose,
  onSaved,
}) => {
  const [title, setTitle] = useState(reelToEdit?.title || "");
  const [caption, setCaption] = useState(reelToEdit?.caption || "");
  const [videoUrl, setVideoUrl] = useState(
    reelToEdit?.videoUrl ||
      "https://assets.mixkit.co/videos/preview/mixkit-doctor-checking-a-patient-pulse-rate-41584-large.mp4"
  );
  const [thumbnail, setThumbnail] = useState(
    reelToEdit?.thumbnail ||
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80"
  );
  const [category, setCategory] = useState(reelToEdit?.category || "Health Tips");
  const [tags, setTags] = useState(reelToEdit?.tags?.join(", ") || "QuickHealth, DoctorAdvice");
  const [duration, setDuration] = useState(reelToEdit?.duration || "0:30");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !videoUrl.trim()) {
      setError("Title and Video URL are required.");
      return;
    }

    setLoading(true);
    setError(null);

    const reelPayload = {
      title,
      caption,
      videoUrl,
      thumbnail,
      category,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      duration,
    };

    try {
      if (reelToEdit) {
        const res = await reelService.updateReel(reelToEdit._id, reelPayload);
        if (res.success) onSaved(res.reel);
      } else {
        const res = await reelService.createReel(reelPayload);
        if (res.success) onSaved(res.reel);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save reel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <Film className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {reelToEdit ? "Edit Health Reel" : "Upload Medical Video Reel"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Reel Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 15-Second Pulse Measurement Demo"
              className="input-health text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Video URL (MP4 / WebM direct stream)
            </label>
            <input
              type="url"
              required
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://assets.mixkit.co/videos/..."
              className="input-health text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Cover Poster Image URL
              </label>
              <input
                type="url"
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="input-health text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Duration
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="0:35"
                className="input-health text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Caption & Clinical Notes
            </label>
            <textarea
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Describe what viewers will learn from this short video..."
              className="input-health text-xs resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Hashtags (Comma separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Cardiology, QuickTips, HealthHacks"
              className="input-health text-xs"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary !py-2.5 !px-5 !text-xs flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{reelToEdit ? "Update Reel" : "Upload Reel"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};