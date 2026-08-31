import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Doctor from '../models/Doctor';
import Patient from '../models/Patient';
import { AuthRequest } from '../middleware/auth';

const generateToken = (id: string, role: string): string => {
  const secret = process.env.JWT_SECRET || 'super_secret_curapulse_jwt_key_2026_secure';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id, role }, secret, { expiresIn } as any);
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, specialty, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'User already exists with this email' });
      return;
    }

    const defaultAvatars = {
      doctor: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80',
      patient: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      admin: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    };

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'patient',
      phone: phone || '',
      avatar: defaultAvatars[role as keyof typeof defaultAvatars] || defaultAvatars.patient,
    });

    if (user.role === 'doctor') {
      await Doctor.create({
        userId: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        specialty: specialty || 'General Medicine',
        qualifications: ['MBBS'],
        experienceYears: 3,
        hospitalName: 'CuraPulse Medical Network',
        bio: "Dedicated healthcare specialist committed to delivering exceptional patient care.",
        consultationFee: 60,
        rating: 5.0,
        reviewCount: 1,
        location: { city: 'New York', state: 'NY', address: '5th Avenue Medical Suites' },
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        timeSlots: ['09:00 AM', '10:30 AM', '02:00 PM', '04:00 PM'],
      });
    } else {
      await Patient.create({
        userId: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        phone: user.phone,
      });
    }

    const token = generateToken(user._id.toString(), user.role);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide email and password' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    let doctorProfile = null;
    if (user.role === 'doctor') {
      doctorProfile = await Doctor.findOne({ userId: user._id });
    }

    const token = generateToken(user._id.toString(), user.role);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        doctorProfileId: doctorProfile?._id,
        specialty: doctorProfile?.specialty,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Login failed' });
  }
};

export const demoLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role } = req.body; // 'patient' | 'doctor'
    const targetEmail = role === 'doctor' ? 'doctor@test.com' : 'patient@test.com';

    let user = await User.findOne({ email: targetEmail });
    if (!user) {
      res.status(404).json({ success: false, message: 'Demo user for ' + role + ' not found. Please run seed script.' });
      return;
    }

    let doctorProfile = null;
    if (user.role === 'doctor') {
      doctorProfile = await Doctor.findOne({ userId: user._id });
    }

    const token = generateToken(user._id.toString(), user.role);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        doctorProfileId: doctorProfile?._id,
        specialty: doctorProfile?.specialty,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Demo login failed' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    let doctorProfile = null;
    let patientProfile = null;

    if (req.user.role === 'doctor') {
      doctorProfile = await Doctor.findOne({ userId: req.user._id });
    } else if (req.user.role === 'patient') {
      patientProfile = await Patient.findOne({ userId: req.user._id });
    }

    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar,
        phone: req.user.phone,
        doctorProfile,
        patientProfile,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch current user' });
  }
};
