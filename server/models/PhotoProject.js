import mongoose from 'mongoose';

const photoProjectSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  originalUrl: { type: String, required: true },
  editedUrl: { type: String },
  width: { type: Number },
  height: { type: Number },
  filters: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now }
});

const PhotoProjectModel = mongoose.models.PhotoProject || mongoose.model('PhotoProject', photoProjectSchema);

export const PhotoStore = {
  async findByUser(userId) {
    return await PhotoProjectModel.find({ userId }).sort({ createdAt: -1 });
  },

  async findById(id) {
    return await PhotoProjectModel.findById(id);
  },

  async create(data) {
    const proj = new PhotoProjectModel(data);
    return await proj.save();
  },

  async update(id, data) {
    return await PhotoProjectModel.findByIdAndUpdate(id, data, { new: true });
  },

  async delete(id) {
    await PhotoProjectModel.findByIdAndDelete(id);
    return true;
  }
};

export default PhotoProjectModel;
