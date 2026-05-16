const Test = require('../models/Test');

exports.getTests = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.clinicId) {
      filter.clinics = req.query.clinicId;
    }
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { code: { $regex: req.query.search, $options: 'i' } },
        { category: { $regex: req.query.search, $options: 'i' } },
      ];
    }
    const tests = await Test.find(filter).populate('clinics', 'name').sort({ category: 1, name: 1 });
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id).populate('clinics', 'name');
    if (!test) return res.status(404).json({ message: 'Test not found.' });
    res.json(test);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createTest = async (req, res) => {
  try {
    const test = new Test(req.body);
    await test.save();
    await test.populate('clinics', 'name');
    res.status(201).json(test);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateTest = async (req, res) => {
  try {
    const test = await Test.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('clinics', 'name');
    if (!test) return res.status(404).json({ message: 'Test not found.' });
    res.json(test);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteTest = async (req, res) => {
  try {
    const test = await Test.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!test) return res.status(404).json({ message: 'Test not found.' });
    res.json({ message: 'Test deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
