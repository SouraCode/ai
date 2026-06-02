import express from 'express';
import jwt from 'jsonwebtoken';
import { UserStore } from '../models/User.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id.toString(), username: user.username, email: user.email },
    process.env.JWT_SECRET || 'super_secret_plant_key',
    { expiresIn: '7d' }
  );
};

// @route   POST api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  try {
    const userExists = await UserStore.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    const user = await UserStore.create({ username, email, password });
    const token = generateToken(user);
    
    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  
  try {
    const user = await UserStore.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Account not found' });
    }
    
    const isMatch = await UserStore.comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const token = generateToken(user);
    
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   GET api/auth/me
// @desc    Get current user profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await UserStore.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Profile retrieval error:', error);
    res.status(500).json({ message: 'Server error retrieving profile' });
  }
});

// @route   PUT api/auth/profile
// @desc    Update current user profile
router.put('/profile', authMiddleware, async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const user = await UserStore.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updateData = {};
    if (username) updateData.username = username;
    if (email) {
      const emailExists = await UserStore.findOne({ email });
      if (emailExists && emailExists._id.toString() !== req.user.id) {
        return res.status(400).json({ message: 'Email already in use by another account' });
      }
      updateData.email = email;
    }
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }
      updateData.password = password;
    }

    const updated = await UserStore.update(req.user.id, updateData);

    res.json({
      id: updated._id,
      username: updated.username,
      email: updated.email,
      createdAt: updated.createdAt
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

export default router;
