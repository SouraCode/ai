import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const dbConfig = {
  isConnected: false,
  isFallback: false,
};

export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai-multi-tool';
  
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000 // Quick timeout to fail fast if DB isn't running
    });
    dbConfig.isConnected = true;
    console.log('💚 MongoDB connected successfully.');
  } catch (error) {
    dbConfig.isConnected = false;
    dbConfig.isFallback = true;
    process.env.DB_FALLBACK = 'true';
    console.warn('⚠️  MongoDB connection failed. Activating local JSON storage fallback!');
    
    // Ensure the data fallback folder exists
    const fallbackDir = path.resolve('data_fallback');
    if (!fs.existsSync(fallbackDir)) {
      fs.mkdirSync(fallbackDir, { recursive: true });
    }
  }
};

export default dbConfig;
