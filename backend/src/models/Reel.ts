import mongoose, { Document, Schema } from 'mongoose';

export interface IReelComment {
  _id?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: Date;
}

export interface IReel extends Document {
  doctorId: mongoose.Types.ObjectId;
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
  likes: mongoose.Types.ObjectId[];
  likesCount: number;
  viewsCount: number;
  comments: IReelComment[];
  createdAt: Date;
}

const ReelCommentSchema = new Schema<IReelComment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userAvatar: {
      type: String,
      default: '',
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const ReelSchema = new Schema<IReel>(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
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
    title: {
      type: String,
      required: true,
      trim: true,
    },
    caption: {
      type: String,
      default: '',
    },
    videoUrl: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
    duration: {
      type: String,
      default: '0:45',
    },
    category: {
      type: String,
      default: 'Health Tips',
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    likesCount: {
      type: Number,
      default: 0,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    comments: [ReelCommentSchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IReel>('Reel', ReelSchema);
