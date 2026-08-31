import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { seedDatabase } from './seedData';

dotenv.config();

const run = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/curapulse_db';
  console.log(`Connecting to MongoDB at ${uri}...`);
  await mongoose.connect(uri);
  await seedDatabase();
  await mongoose.disconnect();
  console.log('Seed process completed successfully.');
  process.exit(0);
};

run().catch((err) => {
  console.error('Seed runner failed:', err);
  process.exit(1);
});
