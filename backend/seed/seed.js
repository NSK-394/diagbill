require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Clinic = require('../models/Clinic');
const Test = require('../models/Test');
const Bill = require('../models/Bill');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/diagnostic_billing';

const clinicsData = [
  {
    name: 'Apollo Diagnostics',
    address: 'Plot No. 1, Banjara Hills, Hyderabad, Telangana - 500034',
    phone: '040-23456789',
    gst: '36AAAAA0000A1Z5',
    email: 'apollo@diagnostics.com',
    color: '#2563EB',
  },
  {
    name: 'Balaji Diagnostics',
    address: 'H.No. 45, Kukatpally Housing Board, Hyderabad, Telangana - 500072',
    phone: '040-98765432',
    gst: '36BBBBB0000B1Z5',
    email: 'balaji@diagnostics.com',
    color: '#0D9488',
  },
  {
    name: 'Sunrise Health Labs',
    address: '12-2-786/A, Mehdipatnam, Hyderabad, Telangana - 500028',
    phone: '040-27654321',
    gst: '36CCCCC0000C1Z5',
    email: 'sunrise@healthlabs.com',
    color: '#7C3AED',
  },
];

const testsData = [
  { name: 'Complete Blood Count (CBC)', code: 'CBC001', category: 'Hematology', price: 350, description: 'Measures different components of blood including RBC, WBC, platelets.' },
  { name: 'Thyroid Profile (T3, T4, TSH)', code: 'THY001', category: 'Endocrinology', price: 800, description: 'Evaluates thyroid gland function.' },
  { name: 'Vitamin D (25-OH)', code: 'VTD001', category: 'Immunology', price: 1200, description: 'Measures Vitamin D levels in the blood.' },
  { name: 'Blood Sugar Fasting', code: 'BSF001', category: 'Biochemistry', price: 150, description: 'Measures blood glucose after 8-12 hours of fasting.' },
  { name: 'Lipid Profile', code: 'LIP001', category: 'Biochemistry', price: 650, description: 'Measures cholesterol and triglycerides.' },
  { name: 'Liver Function Test (LFT)', code: 'LFT001', category: 'Biochemistry', price: 750, description: 'Evaluates liver function.' },
  { name: 'Kidney Function Test (KFT)', code: 'KFT001', category: 'Biochemistry', price: 700, description: 'Evaluates kidney function including creatinine and urea.' },
  { name: 'HbA1c (Glycated Hemoglobin)', code: 'HBA001', category: 'Biochemistry', price: 550, description: 'Measures average blood sugar over past 3 months.' },
  { name: 'Urine Routine & Microscopy', code: 'URM001', category: 'Microbiology', price: 200, description: 'Comprehensive urine analysis.' },
  { name: 'Vitamin B12', code: 'VTB001', category: 'Immunology', price: 900, description: 'Measures Vitamin B12 levels.' },
  { name: 'HIV 1 & 2 (ELISA)', code: 'HIV001', category: 'Serology', price: 450, description: 'Screening test for HIV infection.' },
  { name: 'Dengue NS1 Antigen', code: 'DNG001', category: 'Serology', price: 600, description: 'Detects dengue virus antigen.' },
  { name: 'ECG (Electrocardiogram)', code: 'ECG001', category: 'Cardiology', price: 300, description: '12-lead ECG for cardiac evaluation.' },
  { name: 'Chest X-Ray', code: 'CXR001', category: 'Radiology', price: 400, description: 'Digital chest X-ray.' },
  { name: 'Serum Calcium', code: 'CAL001', category: 'Biochemistry', price: 250, description: 'Measures calcium levels in blood.' },
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!\n');

    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Clinic.deleteMany({}),
      Test.deleteMany({}),
      Bill.deleteMany({}),
      mongoose.connection.db.collection('counters').deleteMany({}),
    ]);
    console.log('Data cleared.\n');

    console.log('Creating admin user...');
    const admin = new User({
      name: 'Admin User',
      email: 'admin@diagnostic.com',
      password: 'admin123',
      role: 'admin',
    });
    await admin.save();
    console.log('Admin created: admin@diagnostic.com / admin123\n');

    console.log('Creating clinics...');
    const clinics = await Clinic.insertMany(clinicsData);
    console.log(`${clinics.length} clinics created.\n`);

    console.log('Creating tests...');
    const testsWithClinics = testsData.map((t) => ({
      ...t,
      clinics: clinics.map((c) => c._id),
    }));
    const tests = await Test.insertMany(testsWithClinics);
    console.log(`${tests.length} tests created.\n`);

    console.log('Creating sample bills...');
    const sampleBills = [
      {
        clinicId: clinics[0]._id,
        patient: { name: 'Ramesh Kumar', age: 45, gender: 'Male', phone: '9876543210', referredBy: 'Dr. Suresh Reddy' },
        tests: [
          { testId: tests[0]._id, name: tests[0].name, code: tests[0].code, category: tests[0].category, price: tests[0].price, qty: 1 },
          { testId: tests[1]._id, name: tests[1].name, code: tests[1].code, category: tests[1].category, price: tests[1].price, qty: 1 },
          { testId: tests[4]._id, name: tests[4].name, code: tests[4].code, category: tests[4].category, price: tests[4].price, qty: 1 },
        ],
        discount: 10,
        gstRate: 18,
        status: 'paid',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        clinicId: clinics[1]._id,
        patient: { name: 'Priya Sharma', age: 32, gender: 'Female', phone: '8765432109', referredBy: 'Dr. Anitha Rao' },
        tests: [
          { testId: tests[2]._id, name: tests[2].name, code: tests[2].code, category: tests[2].category, price: tests[2].price, qty: 1 },
          { testId: tests[9]._id, name: tests[9].name, code: tests[9].code, category: tests[9].category, price: tests[9].price, qty: 1 },
        ],
        discount: 5,
        gstRate: 18,
        status: 'paid',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        clinicId: clinics[0]._id,
        patient: { name: 'Venkat Rao', age: 58, gender: 'Male', phone: '7654321098', referredBy: 'Dr. Kumar Naidu' },
        tests: [
          { testId: tests[3]._id, name: tests[3].name, code: tests[3].code, category: tests[3].category, price: tests[3].price, qty: 1 },
          { testId: tests[7]._id, name: tests[7].name, code: tests[7].code, category: tests[7].category, price: tests[7].price, qty: 1 },
          { testId: tests[5]._id, name: tests[5].name, code: tests[5].code, category: tests[5].category, price: tests[5].price, qty: 1 },
          { testId: tests[6]._id, name: tests[6].name, code: tests[6].code, category: tests[6].category, price: tests[6].price, qty: 1 },
        ],
        discount: 0,
        gstRate: 18,
        status: 'pending',
        createdAt: new Date(),
      },
    ];

    for (const billData of sampleBills) {
      const subtotal = billData.tests.reduce((sum, t) => sum + t.price * t.qty, 0);
      const discountAmount = (subtotal * billData.discount) / 100;
      const afterDiscount = subtotal - discountAmount;
      const gstAmount = (afterDiscount * billData.gstRate) / 100;
      const total = afterDiscount + gstAmount;

      const bill = new Bill({ ...billData, subtotal, gstAmount, total });
      await bill.save();
      console.log(`  Bill created: ${bill.billNumber} for ${billData.patient.name} - Rs. ${total.toFixed(2)}`);
    }

    console.log('\n=== SEED COMPLETE ===');
    console.log('Login: admin@diagnostic.com / admin123');
    console.log(`Clinics: ${clinics.length} | Tests: ${tests.length} | Bills: ${sampleBills.length}`);

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
