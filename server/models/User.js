import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Hash password and normalize email/username before saving
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

export const UserStore = {
  async findOne({ email }) {
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    return await UserModel.findOne({ email: cleanEmail });
  },

  async findById(id) {
    return await UserModel.findById(id);
  },

  async create({ username, email, password }) {
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const cleanUsername = username ? username.trim() : '';
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
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }
    return await UserModel.findByIdAndUpdate(id, updateData, { new: true });
  }
};

export default UserModel;
