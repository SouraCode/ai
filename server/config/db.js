import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import UserModel from '../models/User.js';

const dbConfig = {
  isConnected: false,
  isFallback: false,
};

export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    console.error('❌ MONGODB_URI environment variable is missing!');
    console.error('👉 If deploying to Render, you must add MONGODB_URI to the "Environment" tab in the Render Dashboard.');
  }
  
  const connectionString = mongoURI || 'mongodb://127.0.0.1:27017/ai-multi-tool';
  
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(connectionString, {
      serverSelectionTimeoutMS: 3000 // Quick timeout to fail fast if DB isn't running
    });
    dbConfig.isConnected = true;
    console.log('💚 MongoDB connected successfully.');
    
    // Run migration to normalize all existing user emails/usernames to lowercase/trimmed
    try {
      const users = await UserModel.find({});
      let updatedCount = 0;
      for (const user of users) {
        if (user.email) {
          const lowerEmail = user.email.trim().toLowerCase();
          const trimmedUsername = user.username ? user.username.trim() : '';
          let dirty = false;
          if (user.email !== lowerEmail) {
            user.email = lowerEmail;
            dirty = true;
          }
          if (user.username !== trimmedUsername) {
            user.username = trimmedUsername;
            dirty = true;
          }
          if (dirty) {
            await user.save();
            updatedCount++;
          }
        }
      }
      if (updatedCount > 0) {
        console.log(`🧹 Database migration: normalized ${updatedCount} user accounts.`);
      }
    } catch (migError) {
      console.error('⚠️ User email migration failed:', migError);
    }
  } catch (error) {
    dbConfig.isConnected = false;
    dbConfig.isFallback = true;
    process.env.DB_FALLBACK = 'true';
    console.error('⚠️  MongoDB connection failed:', error.message || error);
    console.warn('⚠️  Activating local JSON storage fallback!');
    
    // Ensure the data fallback folder exists
    const fallbackDir = path.resolve('data_fallback');
    if (!fs.existsSync(fallbackDir)) {
      fs.mkdirSync(fallbackDir, { recursive: true });
    }
  }
};

export default dbConfig;
