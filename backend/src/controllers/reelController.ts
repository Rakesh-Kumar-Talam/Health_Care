import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Reel from '../models/Reel';
import Doctor from '../models/Doctor';
import { AuthRequest } from '../middleware/auth';

export const getReels = async (req: Request, res: Response): Promise<void> => {
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
        { caption: searchRegex },
        { doctorName: searchRegex },
        { tags: searchRegex },
      ];
    }

    const reels = await Reel.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reels.length,
      reels,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch reels' });
  }
};

export const getReelById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const reel = await Reel.findById(id);

    if (!reel) {
      res.status(404).json({ success: false, message: 'Reel not found' });
      return;
    }

    // Increment views
    reel.viewsCount += 1;
    await reel.save();

    res.status(200).json({
      success: true,
      reel,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch reel' });
  }
};

export const createReel = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'doctor') {
      res.status(403).json({ success: false, message: 'Only verified doctors can upload health reels' });
      return;
    }

    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      res.status(404).json({ success: false, message: 'Doctor profile not found' });
      return;
    }

    const { title, caption, videoUrl, thumbnail, tags, duration, category } = req.body;

    if (!title || !videoUrl) {
      res.status(400).json({ success: false, message: 'Title and video URL are required' });
      return;
    }

    const reel = await Reel.create({
      doctorId: doctor._id,
      doctorName: doctor.name,
      doctorSpecialty: doctor.specialty,
      doctorAvatar: doctor.avatar || req.user.avatar,
      title,
      caption: caption || '',
      videoUrl,
      thumbnail: thumbnail || 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map((t: string) => t.trim()) : ['HealthReels']),
      duration: duration || '0:45',
      category: category || 'Health Tips',
    });

    res.status(201).json({
      success: true,
      message: 'Reel uploaded successfully',
      reel,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to create reel' });
  }
};

export const updateReel = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const reel = await Reel.findById(id);

    if (!reel) {
      res.status(404).json({ success: false, message: 'Reel not found' });
      return;
    }

    const doctor = await Doctor.findOne({ userId: req.user?._id });
    if (!doctor || reel.doctorId.toString() !== doctor._id.toString()) {
      res.status(403).json({ success: false, message: 'You can only edit your own reels' });
      return;
    }

    const { title, caption, videoUrl, thumbnail, tags, category } = req.body;

    if (title) reel.title = title;
    if (caption !== undefined) reel.caption = caption;
    if (videoUrl) reel.videoUrl = videoUrl;
    if (thumbnail) reel.thumbnail = thumbnail;
    if (tags) reel.tags = Array.isArray(tags) ? tags : tags.split(',').map((t: string) => t.trim());
    if (category) reel.category = category;

    await reel.save();

    res.status(200).json({
      success: true,
      message: 'Reel updated successfully',
      reel,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update reel' });
  }
};

export const deleteReel = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const reel = await Reel.findById(id);

    if (!reel) {
      res.status(404).json({ success: false, message: 'Reel not found' });
      return;
    }

    const doctor = await Doctor.findOne({ userId: req.user?._id });
    if (!doctor || reel.doctorId.toString() !== doctor._id.toString()) {
      res.status(403).json({ success: false, message: 'You can only delete your own reels' });
      return;
    }

    await Reel.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Reel deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to delete reel' });
  }
};

export const toggleLikeReel = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const reel = await Reel.findById(id);

    if (!reel) {
      res.status(404).json({ success: false, message: 'Reel not found' });
      return;
    }

    const userId = req.user._id as mongoose.Types.ObjectId;
    const alreadyLikedIndex = reel.likes.findIndex((uid) => uid.toString() === userId.toString());

    let isLiked = false;
    if (alreadyLikedIndex > -1) {
      reel.likes.splice(alreadyLikedIndex, 1);
      isLiked = false;
    } else {
      reel.likes.push(userId);
      isLiked = true;
    }

    reel.likesCount = reel.likes.length;
    await reel.save();

    res.status(200).json({
      success: true,
      isLiked,
      likesCount: reel.likesCount,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to toggle like' });
  }
};

export const addCommentReel = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      res.status(400).json({ success: false, message: 'Comment text cannot be empty' });
      return;
    }

    const reel = await Reel.findById(id);
    if (!reel) {
      res.status(404).json({ success: false, message: 'Reel not found' });
      return;
    }

    const comment = {
      userId: req.user._id as mongoose.Types.ObjectId,
      userName: req.user.name,
      userAvatar: req.user.avatar || '',
      text: text.trim(),
      createdAt: new Date(),
    };

    reel.comments.unshift(comment as any);
    await reel.save();

    res.status(201).json({
      success: true,
      message: 'Comment added',
      comments: reel.comments,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to add comment' });
  }
};
