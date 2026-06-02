import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const resumeProjectSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  templateId: { type: String, default: 'modern' },
  personalInfo: { type: Object, default: {} },
  experience: { type: Array, default: [] },
  education: { type: Array, default: [] },
  skills: { type: Array, default: [] },
  projects: { type: Array, default: [] },
  certifications: { type: Array, default: [] },
  languages: { type: Array, default: [] },
  volunteerWork: { type: Array, default: [] },
  awards: { type: Array, default: [] },
  hobbies: { type: Array, default: [] },
  publications: { type: Array, default: [] },
  references: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now }
});

const ResumeProjectModel = mongoose.models.ResumeProject || mongoose.model('ResumeProject', resumeProjectSchema);

// ---- FALLBACK STORE IMPLEMENTATION ----
const getFallbackPath = () => path.resolve('data_fallback', 'resumes.json');

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

export const ResumeStore = {
  async findByUser(userId) {
    if (process.env.DB_FALLBACK === 'true') {
      const projects = readFallbackProjects();
      return projects.filter(p => p.userId === userId).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return await ResumeProjectModel.find({ userId }).sort({ createdAt: -1 });
  },

  async findById(id) {
    if (process.env.DB_FALLBACK === 'true') {
      const projects = readFallbackProjects();
      return projects.find(p => p._id === id) || null;
    }
    return await ResumeProjectModel.findById(id);
  },

  async create(data) {
    if (process.env.DB_FALLBACK === 'true') {
      const projects = readFallbackProjects();
      const newProj = {
        _id: 'resume_' + Math.random().toString(36).substr(2, 9),
        ...data,
        createdAt: new Date().toISOString()
      };
      projects.push(newProj);
      writeFallbackProjects(projects);
      return newProj;
    }
    const proj = new ResumeProjectModel(data);
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
    return await ResumeProjectModel.findByIdAndUpdate(id, data, { new: true });
  },

  async delete(id) {
    if (process.env.DB_FALLBACK === 'true') {
      const projects = readFallbackProjects();
      const filtered = projects.filter(p => p._id !== id);
      writeFallbackProjects(filtered);
      return true;
    }
    await ResumeProjectModel.findByIdAndDelete(id);
    return true;
  }
};

export default ResumeProjectModel;
