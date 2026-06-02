import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

// Route Imports
import authRoutes from './routes/auth.js';
import photoRoutes from './routes/photos.js';
import pptRoutes from './routes/ppt.js';
import resumeRoutes from './routes/resumes.js';

// Environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB with automated file fallback
connectDB();

// Global Middleware
app.use(cors({
  origin: '*', // Allow connections from frontend Vite dev server or production hosting
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' })); // Support base64 image edits
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve Uploaded Files Statically
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/ppt', pptRoutes);
app.use('/api/resumes', resumeRoutes);

// Health Check / Sanity Check Endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'MERN Multi-Tool Application Server API running successfully.',
    dbFallbackMode: process.env.DB_FALLBACK === 'true'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.stack);
  res.status(500).json({
    message: err.message || 'An unexpected internal server error occurred.'
  });
});

// Start Server Listening
app.listen(PORT, () => {
  console.log(`🚀 Server launched successfully! Listening on port ${PORT}`);
  console.log(`📂 Static uploads served at http://localhost:${PORT}/uploads`);
  console.log(`🔗 Health check available at http://localhost:${PORT}/`);
});
