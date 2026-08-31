import mongoose, { Document, Schema } from 'mongoose';

export interface IHospital extends Document {
  name: string;
  tagline: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  emergencyAvailable: boolean;
  totalBeds: number;
  rating: number;
  reviewCount: number;
  image: string;
  gallery: string[];
  specialties: string[];
  facilities: string[];
  establishedYear: number;
  website: string;
  createdAt: Date;
}

const HospitalSchema = new Schema<IHospital>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    tagline: {
      type: String,
      default: 'Premier Multispeciality Healthcare',
    },
    description: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    zipCode: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: '',
    },
    emergencyAvailable: {
      type: Boolean,
      default: true,
    },
    totalBeds: {
      type: Number,
      default: 250,
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
      default: '',
    },
    gallery: {
      type: [String],
      default: [],
    },
    specialties: {
      type: [String],
      default: [],
    },
    facilities: {
      type: [String],
      default: [],
    },
    establishedYear: {
      type: Number,
      default: 2005,
    },
    website: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IHospital>('Hospital', HospitalSchema);
