const Clinic = require('../models/Clinic');

exports.getClinics = async (req, res) => {
  try {
    const clinics = await Clinic.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(clinics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getClinic = async (req, res) => {
  try {
    const clinic = await Clinic.findById(req.params.id);
    if (!clinic) return res.status(404).json({ message: 'Clinic not found.' });
    res.json(clinic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createClinic = async (req, res) => {
  try {
    const clinic = new Clinic(req.body);
    await clinic.save();
    res.status(201).json(clinic);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateClinic = async (req, res) => {
  try {
    const clinic = await Clinic.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!clinic) return res.status(404).json({ message: 'Clinic not found.' });
    res.json(clinic);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteClinic = async (req, res) => {
  try {
    const clinic = await Clinic.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!clinic) return res.status(404).json({ message: 'Clinic not found.' });
    res.json({ message: 'Clinic deactivated successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
