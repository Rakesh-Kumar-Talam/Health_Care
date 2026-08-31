import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/curapulse_db';
    const conn = await mongoose.connect(connStr, { serverSelectionTimeoutMS: 3000 });
    console.log("MongoDB Connected: " + conn.connection.host);
  } catch (error: any) {
    console.warn("⚠️ MongoDB connection warning: " + (error?.message || error) + ". Express server will stay running.");
  }
};
