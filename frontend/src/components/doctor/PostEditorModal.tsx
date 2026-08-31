import React, { useState } from "react";
import { Post } from "../../types";
import { postService } from "../../services/postService";
import { X, Image as ImageIcon, Sparkles, Send } from "lucide-react";

interface PostEditorModalProps {
  postToEdit?: Post | null;
  onClose: () => void;
  onSaved: (post: Post) => void;
}

export const PostEditorModal: React.FC<PostEditorModalProps> = ({
  postToEdit,
  onClose,
  onSaved,
}) => {
  const [title, setTitle] = useState(postToEdit?.title || "");
  const [category, setCategory] = useState(postToEdit?.category || "General Health");
  const [coverImage, setCoverImage] = useState(
    postToEdit?.coverImage ||
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80"
  );
  const [content, setContent] = useState(postToEdit?.content || "");
  const [tags, setTags] = useState(postToEdit?.tags?.join(", ") || "HeartHealth, PreventiveCare");
  const [readTime, setReadTime] = useState(postToEdit?.readTime || "3 min read");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }

    setLoading(true);
    setError(null);

    const postPayload = {
      title,
      category,
      coverImage,
      content,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      readTime,
    };

    try {
      if (postToEdit) {
        const res = await postService.updatePost(postToEdit._id, postPayload);
        if (res.success) onSaved(res.post);
      } else {
        const res = await postService.createPost(postPayload);
        if (res.success) onSaved(res.post);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {postToEdit ? "Edit Clinical Post" : "Publish Health Article / Post"}
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
              Article Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 5 Science-Backed Ways to Lower Blood Pressure"
              className="input-health text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-health text-xs"
              >
                <option value="Cardiology">Cardiology</option>
                <option value="Dermatology">Dermatology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Neurology">Neurology</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="General Health">General Health</option>
                <option value="Nutrition & Wellness">Nutrition & Wellness</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Estimated Read Time
              </label>
              <input
                type="text"
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                placeholder="e.g. 4 min read"
                className="input-health text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Cover Image URL
            </label>
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="input-health text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Article Content (Clinical Advice & Tips)
            </label>
            <textarea
              rows={6}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your clinical insights, patient advice, or medical updates..."
              className="input-health text-xs resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Hashtags (Comma Separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="HeartHealth, Wellness, CardioTips"
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
              <span>{postToEdit ? "Update Article" : "Publish to Community"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};