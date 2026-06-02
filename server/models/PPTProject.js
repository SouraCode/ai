import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const pptProjectSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  prompt: { type: String, required: true },
  style: { type: String, required: true },
  slides: { type: Array, required: true },
  createdAt: { type: Date, default: Date.now }
});

const PPTProjectModel = mongoose.models.PPTProject || mongoose.model('PPTProject', pptProjectSchema);

// ---- FALLBACK STORE IMPLEMENTATION ----
const getFallbackPath = () => path.resolve('data_fallback', 'ppts.json');

const readFallbackProjects = () => {
  const filepath = getFallbackPath();
  if (!fs.existsSync(filepath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch (e) {
    return [];
  }
};

const writeFallbackProjects = (projects) => {
  fs.writeFileSync(getFallbackPath(), JSON.stringify(projects, null, 2), 'utf8');
};

export const PPTStore = {
  async findByUser(userId) {
    if (process.env.DB_FALLBACK === 'true') {
      const projects = readFallbackProjects();
      return projects.filter(p => p.userId === userId).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return await PPTProjectModel.find({ userId }).sort({ createdAt: -1 });
  },

  async findById(id) {
    if (process.env.DB_FALLBACK === 'true') {
      const projects = readFallbackProjects();
      return projects.find(p => p._id === id) || null;
    }
    return await PPTProjectModel.findById(id);
  },

  async create(data) {
    if (process.env.DB_FALLBACK === 'true') {
      const projects = readFallbackProjects();
      const newProj = {
        _id: 'ppt_' + Math.random().toString(36).substr(2, 9),
        ...data,
        createdAt: new Date().toISOString()
      };
      projects.push(newProj);
      writeFallbackProjects(projects);
      return newProj;
    }
    const proj = new PPTProjectModel(data);
    return await proj.save();
  },

  async update(id, data) {
    if (process.env.DB_FALLBACK === 'true') {
      const projects = readFallbackProjects();
      const idx = projects.findIndex(p => p._id === id);
      if (idx !== -1) {
        projects[idx] = { ...projects[idx], ...data };
        writeFallbackProjects(projects);
        return projects[idx];
      }
      return null;
    }
    return await PPTProjectModel.findByIdAndUpdate(id, data, { new: true });
  },

  async delete(id) {
    if (process.env.DB_FALLBACK === 'true') {
      const projects = readFallbackProjects();
      const filtered = projects.filter(p => p._id !== id);
      writeFallbackProjects(filtered);
      return true;
    }
    await PPTProjectModel.findByIdAndDelete(id);
    return true;
  }
};

export default PPTProjectModel;
