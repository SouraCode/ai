import mongoose from 'mongoose';

const pptProjectSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  prompt: { type: String, required: true },
  style: { type: String, required: true },
  slides: { type: Array, required: true },
  createdAt: { type: Date, default: Date.now }
});

const PPTProjectModel = mongoose.models.PPTProject || mongoose.model('PPTProject', pptProjectSchema);

export const PPTStore = {
  async findByUser(userId) {
    return await PPTProjectModel.find({ userId }).sort({ createdAt: -1 });
  },

  async findById(id) {
    return await PPTProjectModel.findById(id);
  },

  async create(data) {
    const proj = new PPTProjectModel(data);
    return await proj.save();
  },

  async update(id, data) {
    return await PPTProjectModel.findByIdAndUpdate(id, data, { new: true });
  },

  async delete(id) {
    await PPTProjectModel.findByIdAndDelete(id);
    return true;
  }
};

export default PPTProjectModel;
