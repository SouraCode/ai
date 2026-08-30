import mongoose from 'mongoose';

const dbConfig = {
  isConnected: false,
  isFallback: false,
};

export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;
  
  if (!mongoURI) {
    console.error('❌ MONGODB_URI environment variable is missing!');
    console.error('👉 If deploying to Render, you must add MONGODB_URI to the "Environment" tab in the Render Dashboard.');
    dbConfig.isFallback = true;
    process.env.DB_FALLBACK = 'true';
    return;
  }
  
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000
    });
    dbConfig.isConnected = true;
    console.log('💚 MongoDB connected successfully.');
  } catch (error) {
    dbConfig.isConnected = false;
    dbConfig.isFallback = true;
    process.env.DB_FALLBACK = 'true';
    console.error('⚠️  MongoDB connection failed:', error.message || error);
    console.warn('⚠️  Activating local JSON storage fallback!');
  }
};

export default dbConfig;
