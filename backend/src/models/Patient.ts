import mongoose, { Document, Schema } from 'mongoose';

export interface IVitals {
  bloodPressure?: {
    systolic?: number;
    diastolic?: number;
  };
  heightCm?: number;
  weightKg?: number;
  bloodSugar?: {
    fasting?: number;
    postPrandial?: number;
    random?: number;
  };
  lastUpdated?: Date;
}

export interface IPatient extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  avatar: string;
  phone: string;
  dateOfBirth?: Date;
  gender: 'male' | 'female' | 'other' | 'unspecified';
  bloodGroup: string;
  allergies: string[];
  vitals?: IVitals;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  createdAt: Date;
}

const PatientSchema = new Schema<IPatient>(
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
    phone: {
      type: String,
      default: '',
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'unspecified'],
      default: 'unspecified',
    },
    bloodGroup: {
      type: String,
      default: 'O+',
    },
    allergies: {
      type: [String],
      default: [],
    },
    emergencyContact: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      relationship: { type: String, default: '' },
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zipCode: { type: String, default: '' },
    },
    vitals: {
      bloodPressure: {
        systolic: { type: Number, default: 120 },
        diastolic: { type: Number, default: 80 },
      },
      heightCm: { type: Number, default: 168 },
      weightKg: { type: Number, default: 65 },
      bloodSugar: {
        fasting: { type: Number, default: 95 },
        postPrandial: { type: Number, default: 130 },
        random: { type: Number },
      },
      lastUpdated: { type: Date, default: Date.now },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IPatient>('Patient', PatientSchema);
