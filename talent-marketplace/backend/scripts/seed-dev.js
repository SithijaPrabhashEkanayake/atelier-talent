// Dev-only seed script — creates a throwaway admin account and a throwaway
// model account for local testing. Refuses to run unless NODE_ENV is
// explicitly NOT 'production', and generates a random password each run
// instead of a hardcoded one, printed once to the console.
//
// Run with:  node scripts/seed-dev.js
require('dotenv').config();
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = require('../models/User');

if (process.env.NODE_ENV === 'production') {
  console.error(
    'Refusing to run seed-dev.js with NODE_ENV=production. This script is for local/dev use only.',
  );
  process.exit(1);
}

const randomPassword = () => crypto.randomBytes(9).toString('base64url'); // 12 chars

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    const accounts = [
      { email: 'model@talent.local', role: 'model', password: randomPassword() },
      { email: 'admin@talent.local', role: 'admin', password: randomPassword() },
    ];

    await User.deleteMany({ email: { $in: accounts.map((a) => a.email) } });
    await User.create(accounts.map(({ email, role, password }) => ({ email, role, password })));

    console.log('\nSeed accounts created (dev only — do not use in production):');
    accounts.forEach((a) =>
      console.log(`  ${a.role.padEnd(20)} ${a.email}  password: ${a.password}`),
    );
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding DB:', error);
    process.exit(1);
  }
};

seedDB();
