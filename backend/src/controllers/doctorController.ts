import { Request, Response } from 'express';
import Doctor from '../models/Doctor';
import Post from '../models/Post';
import Reel from '../models/Reel';
import { AuthRequest } from '../middleware/auth';

export const getDoctors = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, specialty, city, minRating, maxFee, experience, sort } = req.query;

    const query: any = {};

    if (search) {
      const searchRegex = new RegExp(String(search), 'i');
      query.$or = [
        { name: searchRegex },
        { specialty: searchRegex },
        { hospitalName: searchRegex },
        { 'location.city': searchRegex },
      ];
    }

    if (specialty && specialty !== 'All') {
      query.specialty = new RegExp(String(specialty), 'i');
    }

    if (city && city !== 'All') {
      query['location.city'] = new RegExp(String(city), 'i');
    }

    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    if (maxFee) {
      query.consultationFee = { $lte: Number(maxFee) };
    }

    if (experience) {
      query.experienceYears = { $gte: Number(experience) };
    }

    let sortOption: any = { rating: -1, reviewCount: -1 };
    if (sort === 'fee_low') sortOption = { consultationFee: 1 };
    if (sort === 'fee_high') sortOption = { consultationFee: -1 };
    if (sort === 'experience') sortOption = { experienceYears: -1 };
    if (sort === 'name') sortOption = { name: 1 };

    const doctors = await Doctor.find(query).sort(sortOption).populate('hospitalId', 'name city emergencyAvailable rating');

    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch doctors' });
  }
};

export const getDoctorById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findById(id).populate('hospitalId');
    if (!doctor) {
      res.status(404).json({ success: false, message: 'Doctor not found' });
      return;
    }

    // Increment profile views
    doctor.profileViews += 1;
    await doctor.save();

    // Fetch doctor's recent posts and reels
    const posts = await Post.find({ doctorId: doctor._id }).sort({ createdAt: -1 }).limit(6);
    const reels = await Reel.find({ doctorId: doctor._id }).sort({ createdAt: -1 }).limit(6);

    res.status(200).json({
      success: true,
      doctor,
      posts,
      reels,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch doctor details' });
  }
};

export const updateDoctorProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'doctor') {
      res.status(403).json({ success: false, message: 'Only doctors can update doctor profiles' });
      return;
    }

    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      res.status(404).json({ success: false, message: 'Doctor profile not found' });
      return;
    }

    const {
      name,
      avatar,
      specialty,
      qualifications,
      experienceYears,
      hospitalName,
      bio,
      about,
      consultationFee,
      location,
      availableDays,
      timeSlots,
      languages,
      services,
    } = req.body;

    if (name) doctor.name = name;
    if (avatar) doctor.avatar = avatar;
    if (specialty) doctor.specialty = specialty;
    if (qualifications) doctor.qualifications = qualifications;
    if (experienceYears !== undefined) doctor.experienceYears = Number(experienceYears);
    if (hospitalName) doctor.hospitalName = hospitalName;
    if (bio) doctor.bio = bio;
    if (about) doctor.about = about;
    if (consultationFee !== undefined) doctor.consultationFee = Number(consultationFee);
    if (location) doctor.location = { ...doctor.location, ...location };
    if (availableDays) doctor.availableDays = availableDays;
    if (timeSlots) doctor.timeSlots = timeSlots;
    if (languages) doctor.languages = languages;
    if (services) doctor.services = services;

    await doctor.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      doctor,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update profile' });
  }
};

export const getSpecialties = async (req: Request, res: Response): Promise<void> => {
  try {
    const specialties = await Doctor.distinct('specialty');
    res.status(200).json({
      success: true,
      specialties: ['All', ...specialties.filter(Boolean)],
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch specialties' });
  }
};
