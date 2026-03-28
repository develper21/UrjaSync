import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './src/config/database.js';
import seedDatabase from './src/utils/seeder.js';

dotenv.config();

const seed = async () => {
  await connectDB();
  await seedDatabase();
  mongoose.connection.close();
  process.exit(0);
};

seed();
