import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import authMiddleware from '../middleware/authMiddleware.js';
import { PhotoStore } from '../models/PhotoProject.js';

const router = express.Router();

// Ensure uploads folder exists
const uploadsDir = path.resolve('uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, JPEG, PNG, and WEBP image uploads are supported.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit
});

// @route   POST api/photos/upload
// @desc    Upload original photo and create a new project
router.post('/upload', authMiddleware, upload.single('photo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image file uploaded' });
  }

  try {
    const fileUrl = `/uploads/${req.file.filename}`;
    const name = req.body.name || req.file.originalname.split('.')[0] || 'Untitled Photo';
    
    const project = await PhotoStore.create({
      userId: req.user.id,
      name,
      originalUrl: fileUrl,
      editedUrl: fileUrl, // Initially original
      width: req.body.width ? parseInt(req.body.width) : 800,
      height: req.body.height ? parseInt(req.body.height) : 600,
      filters: {}
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({ message: 'Server error uploading photo' });
  }
});

// @route   GET api/photos
// @desc    Get all photo projects for the current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const projects = await PhotoStore.findByUser(req.user.id);
    res.json(projects);
  } catch (error) {
    console.error('Fetch photos error:', error);
    res.status(500).json({ message: 'Server error retrieving photo projects' });
  }
});

// @route   PUT api/photos/:id
// @desc    Update/Save edited photo details (e.g. filters, dimensions or base64 edits)
router.put('/:id', authMiddleware, async (req, res) => {
  const { name, editedUrl, filters, width, height } = req.body;
  
  try {
    let project = await PhotoStore.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Photo project not found' });
    }
    
    // Check ownership
    if (project.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to modify this project' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (editedUrl) updateData.editedUrl = editedUrl;
    if (filters) updateData.filters = filters;
    if (width) updateData.width = width;
    if (height) updateData.height = height;

    const updatedProject = await PhotoStore.update(req.params.id, updateData);
    res.json(updatedProject);
  } catch (error) {
    console.error('Update photo project error:', error);
    res.status(500).json({ message: 'Server error saving photo project' });
  }
});

// @route   DELETE api/photos/:id
// @desc    Delete a photo project
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const project = await PhotoStore.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Photo project not found' });
    }
    
    if (project.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }

    // Attempt to delete local upload files
    if (project.originalUrl && project.originalUrl.startsWith('/uploads/')) {
      const filePath = path.join(path.resolve(), project.originalUrl);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) {}
      }
    }

    await PhotoStore.delete(req.params.id);
    res.json({ message: 'Project successfully deleted' });
  } catch (error) {
    console.error('Delete photo project error:', error);
    res.status(500).json({ message: 'Server error deleting photo project' });
  }
});

export default router;
