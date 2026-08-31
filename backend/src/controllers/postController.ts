import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Post from '../models/Post';
import Doctor from '../models/Doctor';
import { AuthRequest } from '../middleware/auth';

export const getPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, search, doctorId } = req.query;

    const query: any = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (doctorId) {
      query.doctorId = doctorId;
    }

    if (search) {
      const searchRegex = new RegExp(String(search), 'i');
      query.$or = [
        { title: searchRegex },
        { content: searchRegex },
        { doctorName: searchRegex },
        { tags: searchRegex },
      ];
    }

    const posts = await Post.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch posts' });
  }
};

export const getPostById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      res.status(404).json({ success: false, message: 'Post not found' });
      return;
    }

    res.status(200).json({
      success: true,
      post,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch post' });
  }
};

export const createPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'doctor') {
      res.status(403).json({ success: false, message: 'Only verified doctors can publish health posts' });
      return;
    }

    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      res.status(404).json({ success: false, message: 'Doctor profile not found' });
      return;
    }

    const { title, content, summary, coverImage, category, tags, readTime } = req.body;

    if (!title || !content) {
      res.status(400).json({ success: false, message: 'Title and content are required' });
      return;
    }

    const post = await Post.create({
      doctorId: doctor._id,
      doctorName: doctor.name,
      doctorSpecialty: doctor.specialty,
      doctorAvatar: doctor.avatar || req.user.avatar,
      title,
      content,
      summary: summary || content.slice(0, 160) + '...',
      coverImage: coverImage || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
      category: category || 'General Health',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map((t: string) => t.trim()) : ['HealthTips']),
      readTime: readTime || '3 min read',
    });

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to create post' });
  }
};

export const updatePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      res.status(404).json({ success: false, message: 'Post not found' });
      return;
    }

    const doctor = await Doctor.findOne({ userId: req.user?._id });
    if (!doctor || post.doctorId.toString() !== doctor._id.toString()) {
      res.status(403).json({ success: false, message: 'You can only edit your own posts' });
      return;
    }

    const { title, content, summary, coverImage, category, tags, readTime } = req.body;

    if (title) post.title = title;
    if (content) post.content = content;
    if (summary) post.summary = summary;
    if (coverImage) post.coverImage = coverImage;
    if (category) post.category = category;
    if (tags) post.tags = Array.isArray(tags) ? tags : tags.split(',').map((t: string) => t.trim());
    if (readTime) post.readTime = readTime;

    await post.save();

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      post,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update post' });
  }
};

export const deletePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      res.status(404).json({ success: false, message: 'Post not found' });
      return;
    }

    const doctor = await Doctor.findOne({ userId: req.user?._id });
    if (!doctor || post.doctorId.toString() !== doctor._id.toString()) {
      res.status(403).json({ success: false, message: 'You can only delete your own posts' });
      return;
    }

    await Post.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to delete post' });
  }
};

export const toggleLikePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required to like posts' });
      return;
    }

    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      res.status(404).json({ success: false, message: 'Post not found' });
      return;
    }

    const userId = req.user._id as mongoose.Types.ObjectId;
    const alreadyLikedIndex = post.likes.findIndex((uid) => uid.toString() === userId.toString());

    let isLiked = false;
    if (alreadyLikedIndex > -1) {
      post.likes.splice(alreadyLikedIndex, 1);
      isLiked = false;
    } else {
      post.likes.push(userId);
      isLiked = true;
    }

    post.likesCount = post.likes.length;
    await post.save();

    res.status(200).json({
      success: true,
      isLiked,
      likesCount: post.likesCount,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to toggle like' });
  }
};

export const addCommentPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required to comment' });
      return;
    }

    const { id } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      res.status(400).json({ success: false, message: 'Comment text cannot be empty' });
      return;
    }

    const post = await Post.findById(id);
    if (!post) {
      res.status(404).json({ success: false, message: 'Post not found' });
      return;
    }

    const comment = {
      userId: req.user._id as mongoose.Types.ObjectId,
      userName: req.user.name,
      userAvatar: req.user.avatar || '',
      userRole: req.user.role,
      text: text.trim(),
      createdAt: new Date(),
    };

    post.comments.unshift(comment as any);
    await post.save();

    res.status(201).json({
      success: true,
      message: 'Comment added',
      comments: post.comments,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to add comment' });
  }
};
