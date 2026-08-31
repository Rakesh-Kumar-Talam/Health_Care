import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { postService } from "../services/postService";
import { reelService } from "../services/reelService";
import { Post, Reel } from "../types";
import { PostCard } from "../components/feed/PostCard";
import { ReelCard } from "../components/feed/ReelCard";
import { SkeletonCard } from "../components/common/SkeletonLoader";
import {
  Compass,
  Film,
  FileText,
  Search,
  Sparkles,
  Flame,
  Stethoscope,
  ArrowRight,
} from "lucide-react";

export const PatientFeedPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"posts" | "reels">("posts");
  const [posts, setPosts] = useState<Post[]>([]);
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [category, setCategory] = useState<string>("All");
  const [search, setSearch] = useState<string>("");

  const categories = [
    "All",
    "Cardiology",
    "Dermatology",
    "Pediatrics",
    "Neurology",
    "Orthopedics",
    "Health Tips",
  ];

  const fetchFeed = async () => {
    setLoading(true);
    try {
      if (activeTab === "posts") {
        const res = await postService.getPosts({
          category: category !== "All" ? category : undefined,
          search: search.trim() || undefined,
        });
        if (res.success) setPosts(res.posts);
      } else {
        const res = await reelService.getReels({
          category: category !== "All" ? category : undefined,
          search: search.trim() || undefined,
        });
        if (res.success) setReels(res.reels);
      }
    } catch (err) {
      console.error("Failed to fetch feed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [activeTab, category]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFeed();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-bold mb-2 border border-teal-200 dark:border-teal-800">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Doctor Social & Clinical Content</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
            Health Discovery Feed
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Stay informed with verified medical articles and clinician-led short video reels
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl self-start md:self-auto border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab("posts")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === "posts"
                ? "bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-md"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Doctor Articles ({posts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("reels")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === "reels"
                ? "bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-md"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Film className="w-4 h-4 text-rose-500" />
            <span>Health Reels ({reels.length})</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                category === cat
                  ? "bg-teal-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-sm w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts or reels..."
              className="input-health !pl-9 !py-2 text-xs"
            />
          </div>
          <button type="submit" className="btn-primary !py-2 !px-3.5 !text-xs shrink-0">
            Search
          </button>
        </form>
      </div>

      {/* Feed Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : activeTab === "posts" ? (
        /* Posts Feed */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {posts.length === 0 ? (
              <div className="card-health p-12 text-center text-slate-500">
                No health articles match your query. Try selecting another category.
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onPostUpdated={(up) =>
                    setPosts((prev) => prev.map((p) => (p._id === up._id ? up : p)))
                  }
                />
              ))
            )}
          </div>

          {/* Right Sidebar Widget */}
          <div className="space-y-6 hidden lg:block">
            {/* Quick Find Doctors Widget */}
            <div className="card-health p-5 space-y-4">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                <Stethoscope className="w-4 h-4 text-teal-600" />
                <span>Need Personalized Medical Care?</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Connect directly with board-certified physicians for tailored evaluations and prescriptions.
              </p>
              <Link to="/doctors" className="btn-primary w-full !py-2.5 !text-xs flex items-center justify-center gap-1.5">
                <span>Explore Doctor Directory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Health Disclaimer */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1">
                <span>⚠️ Clinical Disclaimer</span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">
                Content published on CuraPulse is for informational health wellness and education. It does not replace professional clinical diagnosis.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Video Reels Grid */
        <div>
          {reels.length === 0 ? (
            <div className="card-health p-12 text-center text-slate-500">
              No video reels match your search. Try another category!
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {reels.map((reel) => (
                <ReelCard
                  key={reel._id}
                  reel={reel}
                  onReelUpdated={(up) =>
                    setReels((prev) => prev.map((r) => (r._id === up._id ? up : r)))
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};