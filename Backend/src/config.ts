import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// parseInt will give you a number, or fall back to 8082 if WS_PORT is missing/invalid
export const PORT = parseInt( process.env.WS_PORT || '8083', 10);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chat_app';

console.log("process.env.MONGODB_URI:", process.env.MONGODB_URI);
console.log("MONGODB_URI:", MONGODB_URI);

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}; 