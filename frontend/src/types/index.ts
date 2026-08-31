export interface User {
  id: string;
  name: string;
  email: string;
  role: "patient" | "doctor" | "admin";
  avatar?: string;
  phone?: string;
  doctorProfileId?: string;
  specialty?: string;
  doctorProfile?: Doctor;
  patientProfile?: Patient;
}

export interface Doctor {
  _id: string;
  userId: string;
  name: string;
  email: string;
  avatar: string;
  specialty: string;
  qualifications: string[];
  experienceYears: number;
  hospitalId?: string | Hospital;
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
  createdAt?: string;
}

export interface Patient {
  _id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  dateOfBirth?: string;
  gender: "male" | "female" | "other" | "unspecified";
  bloodGroup: string;
  allergies: string[];
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
}

export interface Hospital {
  _id: string;
  name: string;
  tagline: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  phone?: string;
  email?: string;
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
}

export interface Comment {
  _id?: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userRole: string;
  text: string;
  createdAt: string;
}

export interface Post {
  _id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorAvatar: string;
  title: string;
  content: string;
  summary: string;
  coverImage: string;
  category: string;
  tags: string[];
  readTime: string;
  likes: string[];
  likesCount: number;
  comments: Comment[];
  createdAt: string;
}

export interface ReelComment {
  _id?: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: string;
}

export interface Reel {
  _id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorAvatar: string;
  title: string;
  caption: string;
  videoUrl: string;
  thumbnail: string;
  tags: string[];
  duration: string;
  category: string;
  likes: string[];
  likesCount: number;
  viewsCount: number;
  comments: ReelComment[];
  createdAt: string;
}

export interface Appointment {
  _id: string;
  patientId?: string;
  patientUserId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  doctorId: string;
  doctorUserId: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorAvatar: string;
  hospitalId?: string;
  hospitalName: string;
  appointmentDate: string;
  timeSlot: string;
  type: "in-person" | "video";
  status: "pending" | "confirmed" | "completed" | "cancelled";
  reason: string;
  symptoms: string;
  notes?: string;
  prescription?: string;
  fee: number;
  paymentStatus: "paid" | "pending";
  videoRoomId?: string;
  createdAt: string;
}

export interface DoctorStats {
  totalPatients: number;
  totalAppointments: number;
  todayAppointments: number;
  completedAppointments: number;
  pendingAppointments: number;
  profileViews: number;
  rating: number;
  reviewCount: number;
  totalEarnings: number;
  postsCount: number;
  reelsCount: number;
  consultationFee: number;
}
