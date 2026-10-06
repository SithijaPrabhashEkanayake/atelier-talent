const request = require('supertest');
const { app, server } = require('../server');
const User = require('../models/User');
const ModelProfile = require('../models/ModelProfile');
const CastingCall = require('../models/CastingCall');
const IndustryProfile = require('../models/IndustryProfile');
const { connectTestDb, disconnectTestDb } = require('../testUtils/testDb');

jest.setTimeout(60000);

describe('Public platform stats', () => {
  beforeAll(async () => {
    await connectTestDb();
    await ModelProfile.deleteMany({});
    await CastingCall.deleteMany({});
    await IndustryProfile.deleteMany({});
    await User.deleteMany({});

    const owner = await User.create({
      email: 'owner@stats-test.local',
      password: 'password123',
      role: 'industry_professional',
    });
    const industry = await IndustryProfile.create({
      userId: owner._id,
      organizationName: 'Stats Test Agency',
      organizationType: 'agency',
      country: 'Sri Lanka',
    });

    const base = {
      country: 'Sri Lanka',
      dateOfBirth: new Date('2000-01-01'),
      heightCm: 175,
      category: 'runway',
      representationStatus: 'freelance',
    };
    for (let i = 0; i < 3; i++) {
      const user = await User.create({
        email: `model${i}@stats-test.local`,
        password: 'password123',
        role: 'model',
      });
      await ModelProfile.create({
        ...base,
        userId: user._id,
        fullName: `Model ${i}`,
        isPublished: true,
        isVerified: i === 0,
      });
    }
    const hidden = await User.create({
      email: 'hidden@stats-test.local',
      password: 'password123',
      role: 'model',
    });
    await ModelProfile.create({
      ...base,
      userId: hidden._id,
      fullName: 'Hidden Model',
      isPublished: false,
    });

    await CastingCall.create({
      creatorProfileId: industry._id,
      creatorType: 'industry_professional',
      title: 'Open call',
      description: 'Test casting.',
      country: 'Sri Lanka',
      category: 'runway',
      applicationDeadline: new Date(Date.now() + 86400000),
      status: 'open',
    });
    await CastingCall.create({
      creatorProfileId: industry._id,
      creatorType: 'industry_professional',
      title: 'Closed call',
      description: 'Test casting.',
      country: 'Sri Lanka',
      category: 'runway',
      applicationDeadline: new Date(Date.now() + 86400000),
      status: 'closed',
    });
  });

  afterAll(async () => {
    await ModelProfile.deleteMany({});
    await CastingCall.deleteMany({});
    await IndustryProfile.deleteMany({});
    await User.deleteMany({});
    await disconnectTestDb();
    server.close();
  });

  it('returns counts computed from the database, without auth', async () => {
    const res = await request(app).get('/api/stats');

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual({
      publishedTalent: 3,
      verifiedTalent: 1,
      openCastings: 1,
      submissions: 0,
    });
  });
});
