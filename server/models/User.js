import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Hash password and normalize email/username before saving to MongoDB
userSchema.pre('save', async function(next) {
  if (this.email) {
    this.email = this.email.trim().toLowerCase();
  }
  if (this.username) {
    this.username = this.username.trim();
  }
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const UserModel = mongoose.models.User || mongoose.model('User', userSchema);

// ---- FALLBACK STORE IMPLEMENTATION ----
const getFallbackPath = () => path.resolve('data_fallback', 'users.json');

const readFallbackUsers = () => {
  const filepath = getFallbackPath();
  if (!fs.existsSync(filepath)) return [];
  try {
    const users = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    let dirty = false;
    const normalized = users.map(u => {
      if (u.email) {
        const lower = u.email.trim().toLowerCase();
        if (u.email !== lower) {
          dirty = true;
          return { ...u, email: lower };
        }
      }
      return u;
    });
    if (dirty) {
      writeFallbackUsers(normalized);
    }
    return normalized;
  } catch (e) {
    return [];
  }
};

const writeFallbackUsers = (users) => {
  fs.writeFileSync(getFallbackPath(), JSON.stringify(users, null, 2), 'utf8');
};

export const UserStore = {
  async findOne({ email }) {
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    if (process.env.DB_FALLBACK === 'true') {
      const users = readFallbackUsers();
      return users.find(u => u.email === cleanEmail) || null;
    }
    return await UserModel.findOne({ email: cleanEmail });
  },

  async findById(id) {
    if (process.env.DB_FALLBACK === 'true') {
      const users = readFallbackUsers();
      return users.find(u => u._id === id) || null;
    }
    return await UserModel.findById(id);
  },

  async create({ username, email, password }) {
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const cleanUsername = username ? username.trim() : '';
    if (process.env.DB_FALLBACK === 'true') {
      const users = readFallbackUsers();
      if (users.some(u => u.email === cleanEmail)) {
        throw new Error('User already exists');
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      const newUser = {
        _id: 'user_' + Math.random().toString(36).substr(2, 9),
        username: cleanUsername,
        email: cleanEmail,
        password: hashedPassword,
        createdAt: new Date().toISOString()
      };
      
      users.push(newUser);
      writeFallbackUsers(users);
      return newUser;
    }
    
    const user = new UserModel({ username: cleanUsername, email: cleanEmail, password });
    return await user.save();
  },

  async comparePassword(candidatePassword, hashedPassword) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  },

  async update(id, data) {
    const updateData = { ...data };
    if (updateData.username) {
      updateData.username = updateData.username.trim();
    }
    if (updateData.email) {
      updateData.email = updateData.email.trim().toLowerCase();
    }
    if (process.env.DB_FALLBACK === 'true') {
      const users = readFallbackUsers();
      const idx = users.findIndex(u => u._id === id);
      if (idx !== -1) {
        if (updateData.password) {
          const salt = await bcrypt.genSalt(10);
          updateData.password = await bcrypt.hash(updateData.password, salt);
        }
        users[idx] = { ...users[idx], ...updateData };
        writeFallbackUsers(users);
        return users[idx];
      }
      return null;
    }
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }
    return await UserModel.findByIdAndUpdate(id, updateData, { new: true });
  }
};

export default UserModel;
