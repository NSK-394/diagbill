const Bill = require('../models/Bill');

exports.getBills = async (req, res) => {
  try {
    const filter = {};
    if (req.query.clinicId) filter.clinicId = req.query.clinicId;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) {
      filter.$or = [
        { billNumber: { $regex: req.query.search, $options: 'i' } },
        { 'patient.name': { $regex: req.query.search, $options: 'i' } },
        { 'patient.phone': { $regex: req.query.search, $options: 'i' } },
      ];
    }
    if (req.query.dateFrom || req.query.dateTo) {
      filter.createdAt = {};
      if (req.query.dateFrom) filter.createdAt.$gte = new Date(req.query.dateFrom);
      if (req.query.dateTo) filter.createdAt.$lte = new Date(req.query.dateTo);
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [bills, total] = await Promise.all([
      Bill.find(filter)
        .populate('clinicId', 'name address phone gst')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Bill.countDocuments(filter),
    ]);

    res.json({ bills, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id).populate('clinicId');
    if (!bill) return res.status(404).json({ message: 'Bill not found.' });
    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createBill = async (req, res) => {
  try {
    const { clinicId, patient, tests, discount = 0, gstRate = 18, notes = '', status = 'paid' } = req.body;

    const subtotal = tests.reduce((sum, t) => sum + t.price * (t.qty || 1), 0);
    const discountAmount = (subtotal * discount) / 100;
    const afterDiscount = subtotal - discountAmount;
    const gstAmount = (afterDiscount * gstRate) / 100;
    const total = afterDiscount + gstAmount;

    const bill = new Bill({
      clinicId,
      patient,
      tests,
      subtotal,
      discount,
      gstRate,
      gstAmount,
      total,
      notes,
      status,
    });

    await bill.save();
    await bill.populate('clinicId', 'name address phone gst email');
    res.status(201).json(bill);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateBillStatus = async (req, res) => {
  try {
    const bill = await Bill.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).populate('clinicId', 'name');
    if (!bill) return res.status(404).json({ message: 'Bill not found.' });
    res.json(bill);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
