require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Clinic = require('../models/Clinic');
const Test = require('../models/Test');
const Bill = require('../models/Bill');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/diagnostic_billing';

const NEW_EMAIL = 'charanyamanchala@gmail.com';
const NEW_PASSWORD = 'Charanyamanchala@gmail';
const ADMIN_NAME = 'Charanya Manchala';

async function reset() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!\n');

    console.log('Deleting all bills...');
    const billResult = await Bill.deleteMany({});
    console.log(`  Deleted ${billResult.deletedCount} bills.`);

    console.log('Clearing bill number counters...');
    await mongoose.connection.db.collection('counters').deleteMany({});
    console.log('  Counters cleared.');

    console.log('Deleting all tests...');
    const testResult = await Test.deleteMany({});
    console.log(`  Deleted ${testResult.deletedCount} tests.`);

    console.log('Deleting all clinics...');
    const clinicResult = await Clinic.deleteMany({});
    console.log(`  Deleted ${clinicResult.deletedCount} clinics.`);

    console.log('\nUpdating admin credentials...');
    let admin = await User.findOne({ role: 'admin' });
    if (admin) {
      admin.name = ADMIN_NAME;
      admin.email = NEW_EMAIL;
      admin.password = NEW_PASSWORD;
      await admin.save();
      console.log(`  Updated existing admin.`);
    } else {
      admin = new User({ name: ADMIN_NAME, email: NEW_EMAIL, password: NEW_PASSWORD, role: 'admin' });
      await admin.save();
      console.log(`  Created new admin.`);
    }

    console.log('\n=== RESET COMPLETE ===');
    console.log(`Login email    : ${NEW_EMAIL}`);
    console.log(`Login password : ${NEW_PASSWORD}`);
    console.log('All bills, tests, and clinics have been removed.');
    console.log('You can now add your own clinics and tests from the app.');

    process.exit(0);
  } catch (error) {
    console.error('Reset error:', error);
    process.exit(1);
  }
}

reset();
