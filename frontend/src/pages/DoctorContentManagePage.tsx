import React, { useEffect, useState } from "react";
import { postService } from "../services/postService";
import { reelService } from "../services/reelService";
import { useAuth } from "../context/AuthContext";
import { Post, Reel } from "../types";
import { PostEditorModal } from "../components/doctor/PostEditorModal";
import { ReelEditorModal } from "../components/doctor/ReelEditorModal";
import {
  FileText,
  Film,
  PlusCircle,
  Edit2,
  Trash2,
  Heart,
  Eye,
  MessageCircle,
  Sparkles,
} from "lucide-react";

export const DoctorContentManagePage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"posts" | "reels">("posts");
  const [posts, setPosts] = useState<Post[]>([]);
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [reelModalOpen, setReelModalOpen] = useState(false);
  const [editingReel, setEditingReel] = useState<Reel | null>(null);

  const fetchDoctorContent = async () => {
    setLoading(true);
    try {
      const [postRes, reelRes] = await Promise.all([
        postService.getPosts({ doctorId: user?.doctorProfileId }),
        reelService.getReels({ doctorId: user?.doctorProfileId }),
      ]);
      if (postRes.success) setPosts(postRes.posts);
      if (reelRes.success) setReels(reelRes.reels);
    } catch (err) {
      console.error("Failed to load doctor content:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorContent();
  }, [user]);

  const handleDeletePost = async (id: string) => {
    if (!window.confirm("Delete this health article?")) return;
    try {
      const res = await postService.deletePost(id);
      if (res.success) {
        setPosts((prev) => prev.filter((p) => p._id !== id));
      }
    } catch (err) {
      console.error("Failed to delete post:", err);
    }
  };

  const handleDeleteReel = async (id: string) => {
    if (!window.confirm("Delete this medical video reel?")) return;
    try {
      const res = await reelService.deleteReel(id);
      if (res.success) {
        setReels((prev) => prev.filter((r) => r._id !== id));
      }
    } catch (err) {
      console.error("Failed to delete reel:", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-bold mb-2 border border-teal-200 dark:border-teal-800">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Physician Creator Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
            Manage Posts & Health Reels
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create educational health content, track patient engagement, and manage your public publications
          </p>
        </div>

        {/* Create Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setEditingPost(null);
              setPostModalOpen(true);
            }}
            className="btn-secondary !py-2.5 !px-4 !text-xs flex items-center gap-1.5 shadow"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Post</span>
          </button>

          <button
            onClick={() => {
              setEditingReel(null);
              setReelModalOpen(true);
            }}
            className="btn-primary !py-2.5 !px-4 !text-xs flex items-center gap-1.5 shadow"
          >
            <Film className="w-4 h-4" />
            <span>Upload Reel</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("posts")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === "posts"
              ? "bg-teal-600 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>My Articles ({posts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("reels")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === "reels"
              ? "bg-teal-600 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
          }`}
        >
          <Film className="w-4 h-4" />
          <span>My Health Reels ({reels.length})</span>
        </button>
      </div>

      {/* Content List */}
      {loading ? (
        <div className="space-y-4">
          <div className="card-health p-6 animate-pulse h-28"></div>
          <div className="card-health p-6 animate-pulse h-28"></div>
        </div>
      ) : activeTab === "posts" ? (
        /* Posts Table */
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="card-health p-12 text-center text-slate-500 space-y-3">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-semibold text-sm">You haven't written any health posts yet.</p>
              <button
                onClick={() => {
                  setEditingPost(null);
                  setPostModalOpen(true);
                }}
                className="btn-primary !py-2 !px-4 !text-xs"
              >
                Write Your First Article
              </button>
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post._id}
                className="card-health p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start space-x-4">
                  {post.coverImage && (
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                  )}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                      {post.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{post.summary || post.content}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                      <span className="font-semibold text-teal-600 dark:text-teal-400">{post.category}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-rose-500 font-semibold">
                        <Heart className="w-3 h-3 fill-rose-500" />
                        {post.likesCount || 0} Likes
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {post.comments?.length || 0} Comments
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => {
                      setEditingPost(post);
                      setPostModalOpen(true);
                    }}
                    className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
                    title="Edit Post"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeletePost(post._id)}
                    className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 transition-colors"
                    title="Delete Post"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Reels Grid */
        <div>
          {reels.length === 0 ? (
            <div className="card-health p-12 text-center text-slate-500 space-y-3">
              <Film className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-semibold text-sm">You haven't uploaded any video reels yet.</p>
              <button
                onClick={() => {
                  setEditingReel(null);
                  setReelModalOpen(true);
                }}
                className="btn-primary !py-2 !px-4 !text-xs"
              >
                Upload First Video Reel
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {reels.map((reel) => (
                <div key={reel._id} className="card-health overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="relative h-44 bg-slate-900 overflow-hidden">
                      <img
                        src={reel.thumbnail || "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80"}
                        alt={reel.title}
                        className="w-full h-full object-cover opacity-80"
                      />
                      <div className="absolute bottom-2 left-2 text-[10px] bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-white font-semibold">
                        {reel.duration}
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                        {reel.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2">{reel.caption}</p>

                      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-teal-500" />
                          {reel.viewsCount || 0} views
                        </span>
                        <span className="flex items-center gap-1 text-rose-500 font-semibold">
                          <Heart className="w-3.5 h-3.5 fill-rose-500" />
                          {reel.likesCount || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0 flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditingReel(reel);
                        setReelModalOpen(true);
                      }}
                      className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteReel(reel._id)}
                      className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {postModalOpen && (
        <PostEditorModal
          postToEdit={editingPost}
          onClose={() => setPostModalOpen(false)}
          onSaved={() => {
            setPostModalOpen(false);
            fetchDoctorContent();
          }}
        />
      )}

      {reelModalOpen && (
        <ReelEditorModal
          reelToEdit={editingReel}
          onClose={() => setReelModalOpen(false)}
          onSaved={() => {
            setReelModalOpen(false);
            fetchDoctorContent();
          }}
        />
      )}
    </div>
  );
};