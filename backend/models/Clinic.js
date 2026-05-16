const mongoose = require('mongoose');

const clinicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, default: '' },
  phone: { type: String, default: '' },
  gst: { type: String, default: '' },
  email: { type: String, default: '' },
  logo: { type: String, default: '' },
  color: { type: String, default: '#2563EB' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Clinic', clinicSchema);
