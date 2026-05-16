const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});
const Counter = mongoose.model('Counter', counterSchema);

const billTestSchema = new mongoose.Schema({
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
  name: String,
  code: String,
  category: String,
  price: Number,
  qty: { type: Number, default: 1 },
});

const billSchema = new mongoose.Schema({
  billNumber: { type: String, unique: true },
  clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
  patient: {
    name: { type: String, required: true },
    age: { type: Number },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    phone: { type: String, default: '' },
    referredBy: { type: String, default: '' },
  },
  tests: [billTestSchema],
  subtotal: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  gstRate: { type: Number, default: 18 },
  gstAmount: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  status: { type: String, enum: ['paid', 'pending'], default: 'paid' },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

billSchema.pre('save', async function (next) {
  if (!this.billNumber) {
    try {
      const clinic = await mongoose.model('Clinic').findById(this.clinicId);
      const prefix = clinic
        ? clinic.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 3)
        : 'BIL';
      const year = new Date().getFullYear();
      const counterId = `bill_${prefix}_${year}`;
      const counter = await Counter.findOneAndUpdate(
        { _id: counterId },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
      );
      this.billNumber = `${prefix}-${year}-${String(counter.seq).padStart(4, '0')}`;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

module.exports = mongoose.model('Bill', billSchema);
module.exports.Counter = Counter;
