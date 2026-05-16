const mongoose = require('mongoose');
const Bill = require('../models/Bill');

exports.getBills = async (req, res) => {
  try {
    const filter = {};

    if (req.query.clinicId && mongoose.isValidObjectId(req.query.clinicId)) {
      filter.clinicId = req.query.clinicId;
    }
    if (req.query.status && ['paid', 'pending'].includes(req.query.status)) {
      filter.status = req.query.status;
    }
    if (req.query.search) {
      // Escape special regex characters to prevent ReDoS
      const escaped = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { billNumber: { $regex: escaped, $options: 'i' } },
        { 'patient.name': { $regex: escaped, $options: 'i' } },
        { 'patient.phone': { $regex: escaped, $options: 'i' } },
        { companyName: { $regex: escaped, $options: 'i' } },
      ];
    }
    if (req.query.dateFrom || req.query.dateTo) {
      filter.createdAt = {};
      const from = new Date(req.query.dateFrom);
      const to = new Date(req.query.dateTo);
      if (req.query.dateFrom && !isNaN(from)) filter.createdAt.$gte = from;
      if (req.query.dateTo && !isNaN(to)) filter.createdAt.$lte = to;
      if (!Object.keys(filter.createdAt).length) delete filter.createdAt;
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
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
    res.status(500).json({ message: 'Failed to fetch bills.' });
  }
};

exports.getBill = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid bill ID.' });
    }
    const bill = await Bill.findById(req.params.id).populate('clinicId');
    if (!bill) return res.status(404).json({ message: 'Bill not found.' });
    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bill.' });
  }
};

exports.createBill = async (req, res) => {
  try {
    const {
      clinicId, patient, tests, notes = '', status = 'paid', billDate,
      billingType = 'individual', companyName = '', patients = [],
    } = req.body;

    let { discount = 0, gstRate = 18 } = req.body;

    // Validate required fields
    if (!clinicId || !mongoose.isValidObjectId(clinicId)) {
      return res.status(400).json({ message: 'Valid clinic is required.' });
    }
    if (!Array.isArray(tests) || tests.length === 0) {
      return res.status(400).json({ message: 'At least one test is required.' });
    }

    // Clamp numeric inputs to safe ranges
    discount = Math.min(100, Math.max(0, Number(discount) || 0));
    gstRate = [0, 18].includes(Number(gstRate)) ? Number(gstRate) : 18;

    // Validate status
    const safeStatus = ['paid', 'pending'].includes(status) ? status : 'paid';

    // Sanitize test prices and quantities
    const safeTests = tests.map((t) => ({
      testId: t.testId,
      name: String(t.name || '').slice(0, 200),
      code: String(t.code || '').slice(0, 50),
      category: String(t.category || '').slice(0, 100),
      price: Math.max(0, Number(t.price) || 0),
      qty: Math.max(1, Math.floor(Number(t.qty) || 1)),
    }));

    // Validate bill date
    let safeCreatedAt;
    if (billDate) {
      const d = new Date(billDate);
      safeCreatedAt = isNaN(d) ? new Date() : d;
    }

    const patientCount = billingType === 'corporate' ? Math.max(1, patients.length) : 1;
    const perPersonSubtotal = safeTests.reduce((sum, t) => sum + t.price * t.qty, 0);
    const subtotal = perPersonSubtotal * patientCount;
    const discountAmount = (subtotal * discount) / 100;
    const afterDiscount = subtotal - discountAmount;
    const gstAmount = (afterDiscount * gstRate) / 100;
    const total = afterDiscount + gstAmount;

    const bill = new Bill({
      clinicId,
      billingType,
      ...(billingType === 'individual' ? { patient } : { companyName: String(companyName).slice(0, 200), patients }),
      tests: safeTests,
      patientCount,
      subtotal,
      discount,
      gstRate,
      gstAmount,
      total,
      notes: String(notes).slice(0, 1000),
      status: safeStatus,
      ...(safeCreatedAt && { createdAt: safeCreatedAt }),
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
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid bill ID.' });
    }
    const safeStatus = ['paid', 'pending'].includes(req.body.status) ? req.body.status : null;
    if (!safeStatus) return res.status(400).json({ message: 'Invalid status value.' });

    const bill = await Bill.findByIdAndUpdate(
      req.params.id,
      { status: safeStatus },
      { new: true }
    ).populate('clinicId', 'name');
    if (!bill) return res.status(404).json({ message: 'Bill not found.' });
    res.json(bill);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update status.' });
  }
};
