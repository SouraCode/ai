import mongoose from 'mongoose';

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

export const ResumeStore = {
  async findByUser(userId) {
    return await ResumeProjectModel.find({ userId }).sort({ createdAt: -1 });
  },

  async findById(id) {
    return await ResumeProjectModel.findById(id);
  },

  async create(data) {
    const proj = new ResumeProjectModel(data);
    return await proj.save();
  },

  async update(id, data) {
    return await ResumeProjectModel.findByIdAndUpdate(id, data, { new: true });
  },

  async delete(id) {
    await ResumeProjectModel.findByIdAndDelete(id);
    return true;
  }
};

export default ResumeProjectModel;
