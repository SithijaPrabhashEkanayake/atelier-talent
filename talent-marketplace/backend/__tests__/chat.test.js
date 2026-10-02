const request = require('supertest');
const { app, server } = require('../server');
const mongoose = require('mongoose');
const User = require('../models/User');
const ModelProfile = require('../models/ModelProfile');
const IndustryProfile = require('../models/IndustryProfile');
const CastingCall = require('../models/CastingCall');
const Application = require('../models/Application');
const Message = require('../models/Message');
const { connectTestDb, disconnectTestDb } = require('../testUtils/testDb');

jest.setTimeout(60000);

describe('Direct Messaging & Mutual Consent Verification', () => {
  let modelToken, modelUserId, modelProfileId;
  let recruiterToken, recruiterUserId, recruiterProfileId;
  let thirdToken;
  let pendingAppId, acceptedAppId;

  beforeAll(async () => {
    await connectTestDb();
    if (mongoose.connection.readyState === 1) {
      await Message.deleteMany({});
      await Application.deleteMany({});
      await CastingCall.deleteMany({});
      await ModelProfile.deleteMany({});
      await IndustryProfile.deleteMany({});
      await User.deleteMany({ email: /@chat-test\.local$/ });
    }

    // 1. Model user & profile
    const mReg = await request(app).post('/api/auth/register').send({
      email: 'model@chat-test.local',
      password: 'password123',
      role: 'model',
    });
    modelToken = mReg.body.token;
    modelUserId = mReg.body.user.id;

    const mProf = await ModelProfile.create({
      userId: modelUserId,
      fullName: 'Eva Rostova',
      country: 'France',
      category: 'runway',
      heightCm: 180,
      dateOfBirth: new Date('2000-01-01'),
      representationStatus: 'freelance',
    });
    modelProfileId = mProf._id;

    // 2. Recruiter user & profile
    const rReg = await request(app).post('/api/auth/register').send({
      email: 'recruiter@chat-test.local',
      password: 'password123',
      role: 'industry_professional',
    });
    recruiterToken = rReg.body.token;
    recruiterUserId = rReg.body.user.id;

    const rProf = await IndustryProfile.create({
      userId: recruiterUserId,
      organizationName: 'Luxe Runway Agency',
      organizationType: 'agency',
      country: 'France',
    });
    recruiterProfileId = rProf._id;

    // 3. Third-party bystander user
    const tReg = await request(app).post('/api/auth/register').send({
      email: 'bystander@chat-test.local',
      password: 'password123',
      role: 'model',
    });
    thirdToken = tReg.body.token;

    // 4. Casting call
    const casting = await CastingCall.create({
      title: 'Paris Runway Lead',
      description: 'Exclusive couture showcase in Paris',
      country: 'France',
      category: 'runway',
      creatorProfileId: recruiterProfileId,
      creatorType: 'industry_professional',
      applicationDeadline: new Date(Date.now() + 86400000),
    });

    // 5. Pending Application
    const pendingApp = await Application.create({
      castingCallId: casting._id,
      modelProfileId,
      status: 'submitted',
    });
    pendingAppId = pendingApp._id.toString();

    // 6. Accepted Application (with mutual consent)
    const casting2 = await CastingCall.create({
      title: 'Milan Editorial Brief',
      description: 'Vogue editorial feature',
      country: 'Italy',
      category: 'editorial',
      creatorProfileId: recruiterProfileId,
      creatorType: 'industry_professional',
      applicationDeadline: new Date(Date.now() + 86400000),
    });

    const acceptedApp = await Application.create({
      castingCallId: casting2._id,
      modelProfileId,
      status: 'accepted',
    });
    acceptedAppId = acceptedApp._id.toString();

    // Seed message in accepted conversation
    await Message.create({
      applicationId: acceptedApp._id,
      senderId: recruiterUserId,
      content: 'Congratulations! Welcome to the Milan campaign.',
    });
  });

  afterAll(async () => {
    await disconnectTestDb();
    server.close();
  });

  it('rejects unauthenticated message access with 401', async () => {
    const res = await request(app).get(`/api/messages/${acceptedAppId}`);
    expect(res.statusCode).toBe(401);
  });

  it('blocks chat on pending application with 403 mutual consent error', async () => {
    const res = await request(app)
      .get(`/api/messages/${pendingAppId}`)
      .set('Authorization', `Bearer ${modelToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/only available for accepted applications/i);
  });

  it('blocks third-party users not party to the accepted contract with 403', async () => {
    const res = await request(app)
      .get(`/api/messages/${acceptedAppId}`)
      .set('Authorization', `Bearer ${thirdToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/not authorized/i);
  });

  it('allows the accepted model to view conversation and marks incoming messages read', async () => {
    const res = await request(app)
      .get(`/api/messages/${acceptedAppId}`)
      .set('Authorization', `Bearer ${modelToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].content).toContain('Milan campaign');
  });

  it('allows the casting creator recruiter to view conversation', async () => {
    const res = await request(app)
      .get(`/api/messages/${acceptedAppId}`)
      .set('Authorization', `Bearer ${recruiterToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(1);
  });
});
