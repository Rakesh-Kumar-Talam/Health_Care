import mongoose, { Document, Schema } from 'mongoose';

export interface IComment {
  _id?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userName: string;
  userAvatar: string;
  userRole: string;
  text: string;
  createdAt: Date;
}

export interface IPost extends Document {
  doctorId: mongoose.Types.ObjectId;
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
  likes: mongoose.Types.ObjectId[];
  likesCount: number;
  comments: IComment[];
  createdAt: Date;
}

const CommentSchema = new Schema<IComment>(
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
    userRole: {
      type: String,
      default: 'patient',
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

const PostSchema = new Schema<IPost>(
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
    content: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      default: '',
    },
    coverImage: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: 'General Health',
    },
    tags: {
      type: [String],
      default: [],
    },
    readTime: {
      type: String,
      default: '3 min read',
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
    comments: [CommentSchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IPost>('Post', PostSchema);
