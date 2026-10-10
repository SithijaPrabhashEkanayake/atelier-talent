const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const CastingCall = require('../models/CastingCall');
const ModelProfile = require('../models/ModelProfile');
const Application = require('../models/Application');

function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seedApplications() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');

    const castings = await CastingCall.find({});
    const models = await ModelProfile.find({});

    console.log(`Found ${castings.length} castings and ${models.length} models.`);

    if (!castings.length || !models.length) {
      console.log('Missing castings or models to create applications.');
      process.exit(1);
    }

    // Status distribution: realistic conversion funnel
    // submitted (45%), shortlisted (25%), accepted (18%), rejected (12%)
    const statusPool = [
      'submitted', 'submitted', 'submitted', 'submitted',
      'shortlisted', 'shortlisted', 'shortlisted',
      'accepted', 'accepted',
      'rejected'
    ];

    const applicationDocs = [];
    const seenPairs = new Set();

    // Spread applications over the last 14 days so the time-series chart shows activity
    const now = Date.now();

    for (const casting of castings) {
      // 3 to 8 applicants per casting call
      const applicantCount = randomInt(3, 8);
      
      // Match category preference if possible
      const matchingModels = models.filter(m => m.category === casting.category);
      const pool = matchingModels.length >= 5 ? matchingModels : models;

      for (let i = 0; i < applicantCount; i++) {
        const model = randomPick(pool);
        const pairKey = `${casting._id}-${model._id}`;
        if (seenPairs.has(pairKey)) continue;
        seenPairs.add(pairKey);

        const daysAgo = randomInt(0, 10);
        const createdAt = new Date(now - daysAgo * 24 * 60 * 60 * 1000 - randomInt(1000, 36000000));

        applicationDocs.push({
          castingCallId: casting._id,
          modelProfileId: model._id,
          status: randomPick(statusPool),
          coverLetter: `Hi, I am excited to apply for this ${casting.category} casting call. Please review my verified comp-card and runway portfolio.`,
          createdAt: createdAt,
          updatedAt: createdAt,
        });
      }
    }

    console.log(`Inserting ${applicationDocs.length} realistic applications...`);
    await Application.insertMany(applicationDocs, { ordered: false });

    // Verify statistics
    const total = await Application.countDocuments();
    const submitted = await Application.countDocuments({ status: 'submitted' });
    const shortlisted = await Application.countDocuments({ status: 'shortlisted' });
    const accepted = await Application.countDocuments({ status: 'accepted' });
    const rejected = await Application.countDocuments({ status: 'rejected' });

    console.log('\n=======================================');
    console.log('APPLICATION PIPELINE SEEDED:');
    console.log(`- Total Submissions:  ${total}`);
    console.log(`- Submitted:          ${submitted}`);
    console.log(`- Shortlisted:        ${shortlisted}`);
    console.log(`- Accepted (Matches): ${accepted}`);
    console.log(`- Rejected:           ${rejected}`);
    console.log('=======================================\n');

    await mongoose.disconnect();
    console.log('Finished successfully.');
  } catch (err) {
    console.error('Error seeding applications:', err);
    process.exit(1);
  }
}

seedApplications();
