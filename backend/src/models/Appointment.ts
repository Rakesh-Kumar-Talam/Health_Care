import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointment extends Document {
  patientId: mongoose.Types.ObjectId;
  patientUserId: mongoose.Types.ObjectId;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  doctorId: mongoose.Types.ObjectId;
  doctorUserId: mongoose.Types.ObjectId;
  doctorName: string;
  doctorSpecialty: string;
  doctorAvatar: string;
  hospitalId?: mongoose.Types.ObjectId;
  hospitalName: string;
  appointmentDate: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:00 AM"
  type: 'in-person' | 'video';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  reason: string;
  symptoms: string;
  notes?: string;
  prescription?: string;
  fee: number;
  paymentStatus: 'paid' | 'pending';
  videoRoomId?: string;
  createdAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
    },
    patientUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    patientName: {
      type: String,
      required: true,
    },
    patientEmail: {
      type: String,
      required: true,
    },
    patientPhone: {
      type: String,
      default: '',
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    doctorUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctorName: {
      type: String,
      required: true,
    },
    doctorSpecialty: {
      type: String,
      required: true,
    },
    doctorAvatar: {
      type: String,
      default: '',
    },
    hospitalId: {
      type: Schema.Types.ObjectId,
      ref: 'Hospital',
    },
    hospitalName: {
      type: String,
      default: 'Independent Clinic',
    },
    appointmentDate: {
      type: String,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['in-person', 'video'],
      default: 'in-person',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'confirmed',
    },
    reason: {
      type: String,
      default: 'General Consultation',
    },
    symptoms: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    prescription: {
      type: String,
      default: '',
    },
    fee: {
      type: Number,
      default: 50,
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'pending'],
      default: 'paid',
    },
    videoRoomId: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IAppointment>('Appointment', AppointmentSchema);
