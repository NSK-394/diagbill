const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  category: { type: String, default: 'General' },
  price: { type: Number, required: true, min: 0 },
  description: { type: String, default: '' },
  clinics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Clinic' }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

testSchema.index({ name: 'text', code: 'text', category: 'text' });

module.exports = mongoose.model('Test', testSchema);
