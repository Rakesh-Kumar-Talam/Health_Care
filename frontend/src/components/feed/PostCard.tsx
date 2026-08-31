import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Post } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { postService } from "../../services/postService";
import { Badge } from "../common/Badge";
import {
  Heart,
  MessageCircle,
  Share2,
  Calendar,
  Clock,
  Send,
  User,
  CheckCircle2,
  Bookmark,
} from "lucide-react";

interface PostCardProps {
  post: Post;
  onPostUpdated?: (updated: Post) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onPostUpdated }) => {
  const { user, isAuthenticated } = useAuth();
  const [liked, setLiked] = useState<boolean>(() => {
    if (!user) return false;
    return post.likes?.includes(user.id) || false;
  });
  const [likesCount, setLikesCount] = useState<number>(post.likesCount || 0);
  const [commentsOpen, setCommentsOpen] = useState<boolean>(false);
  const [comments, setComments] = useState(post.comments || []);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const handleLike = async () => {
    if (!isAuthenticated) {
      alert("Please sign in or use demo login to like health articles.");
      return;
    }

    try {
      const prevLiked = liked;
      setLiked(!prevLiked);
      setLikesCount((prev) => (prevLiked ? prev - 1 : prev + 1));

      const res = await postService.toggleLike(post._id);
      if (res.success) {
        setLiked(res.isLiked);
        setLikesCount(res.likesCount);
      }
    } catch (error) {
      console.error("Failed to like post:", error);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert("Please sign in or use demo login to comment.");
      return;
    }
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await postService.addComment(post._id, commentText.trim());
      if (res.success) {
        setComments(res.comments);
        setCommentText("");
      }
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <article className="card-health overflow-hidden transition-all duration-200 hover:shadow-lg">
      {/* Header with Doctor Profile */}
      <div className="p-5 pb-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link to={`/doctors/${post.doctorId}`}>
            <img
              src={post.doctorAvatar || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&auto=format&fit=crop&q=80"}
              alt={post.doctorName}
              className="w-12 h-12 rounded-full object-cover border-2 border-teal-500/40 hover:scale-105 transition-transform"
            />
          </Link>

          <div>
            <div className="flex items-center gap-1.5">
              <Link
                to={`/doctors/${post.doctorId}`}
                className="text-sm font-bold text-slate-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
              >
                {post.doctorName}
              </Link>
              <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 fill-teal-100 dark:fill-teal-950" />
            </div>
            <div className="text-xs font-semibold text-teal-600 dark:text-teal-400">
              {post.doctorSpecialty}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <Badge variant="primary" className="text-[10px]">
            {post.category}
          </Badge>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {post.readTime}
          </span>
        </div>
      </div>

      {/* Cover Image if present */}
      {post.coverImage && (
        <div className="w-full max-h-80 overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover hover:scale-102 transition-transform duration-300"
          />
        </div>
      )}

      {/* Post Content */}
      <div className="p-5 space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
          {post.title}
        </h2>

        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
          {post.content}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 pt-2">
          {post.tags?.map((tag, idx) => (
            <span
              key={idx}
              className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline cursor-pointer"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Interaction Bar */}
      <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center space-x-4">
          {/* Like Button */}
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 font-semibold transition-colors ${
              liked ? "text-rose-500 fill-rose-500" : "hover:text-rose-500"
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? "fill-rose-500 text-rose-500" : ""}`} />
            <span>{likesCount} {likesCount === 1 ? "Like" : "Likes"}</span>
          </button>

          {/* Comment Count */}
          <button
            onClick={() => setCommentsOpen(!commentsOpen)}
            className="flex items-center gap-1.5 hover:text-teal-600 font-semibold transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{comments.length} {comments.length === 1 ? "Comment" : "Comments"}</span>
          </button>
        </div>

        <Link
          to={`/doctors/${post.doctorId}`}
          className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
        >
          Consult Author Doctor &rarr;
        </Link>
      </div>

      {/* Expandable Comments Drawer */}
      {commentsOpen && (
        <div className="bg-slate-50 dark:bg-slate-900/60 p-5 border-t border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in duration-150">
          {/* Comments List */}
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {comments.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No comments yet. Be the first to start the health discussion!</p>
            ) : (
              comments.map((comment, index) => (
                <div key={index} className="flex items-start space-x-2.5">
                  <img
                    src={comment.userAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"}
                    alt={comment.userName}
                    className="w-7 h-7 rounded-full object-cover mt-0.5"
                  />
                  <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 flex-1">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-bold text-slate-800 dark:text-white">
                        {comment.userName}
                      </span>
                      <span className="text-slate-400 text-[10px]">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {comment.text}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Comment Input */}
          <form onSubmit={handleAddComment} className="flex items-center gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a clinical question or comment..."
              className="flex-1 input-health text-xs !py-2"
            />
            <button
              type="submit"
              disabled={submittingComment || !commentText.trim()}
              className="btn-primary !py-2 !px-3.5 !text-xs"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </article>
  );
};
