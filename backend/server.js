require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth.routes');
const clinicRoutes = require('./routes/clinic.routes');
const testRoutes = require('./routes/test.routes');
const billRoutes = require('./routes/bill.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();

connectDB();

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Diagnostic Billing API is running', timestamp: new Date() });
});

app.use('/api/auth', authRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Public scan endpoint — no auth, used by barcode scanner
const Bill = require('./models/Bill');
app.get('/api/public/scan/:billNumber', async (req, res) => {
  try {
    const bill = await Bill.findOne({ billNumber: req.params.billNumber }).populate('clinicId');
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    res.json(bill);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
