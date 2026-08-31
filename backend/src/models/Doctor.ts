import mongoose, { Document, Schema } from 'mongoose';

export interface IDoctor extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  avatar: string;
  specialty: string;
  qualifications: string[];
  experienceYears: number;
  hospitalId?: mongoose.Types.ObjectId;
  hospitalName: string;
  bio: string;
  about: string;
  consultationFee: number;
  rating: number;
  reviewCount: number;
  location: {
    city: string;
    state: string;
    address: string;
  };
  availableDays: string[];
  timeSlots: string[];
  profileViews: number;
  isVerified: boolean;
  languages: string[];
  services: string[];
  createdAt: Date;
}

const DoctorSchema = new Schema<IDoctor>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    specialty: {
      type: String,
      required: true,
      trim: true,
    },
    qualifications: {
      type: [String],
      default: [],
    },
    experienceYears: {
      type: Number,
      default: 0,
    },
    hospitalId: {
      type: Schema.Types.ObjectId,
      ref: 'Hospital',
    },
    hospitalName: {
      type: String,
      default: 'Independent Clinic',
    },
    bio: {
      type: String,
      default: '',
    },
    about: {
      type: String,
      default: '',
    },
    consultationFee: {
      type: Number,
      default: 50,
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    location: {
      city: { type: String, default: 'New York' },
      state: { type: String, default: 'NY' },
      address: { type: String, default: 'Medical Center Plaza' },
    },
    availableDays: {
      type: [String],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
    timeSlots: {
      type: [String],
      default: ['09:00 AM', '10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '05:00 PM'],
    },
    profileViews: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    languages: {
      type: [String],
      default: ['English'],
    },
    services: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IDoctor>('Doctor', DoctorSchema);
