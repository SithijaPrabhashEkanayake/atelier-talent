const request = require('supertest');
const { app, server } = require('../server');
const mongoose = require('mongoose');
const User = require('../models/User');
const ModelProfile = require('../models/ModelProfile');
const IndustryProfile = require('../models/IndustryProfile');
const CastingCall = require('../models/CastingCall');
const Application = require('../models/Application');
const { connectTestDb, disconnectTestDb } = require('../testUtils/testDb');

jest.setTimeout(60000);

describe('Application API — apply flow & status-update authorization', () => {
  let modelToken, organizerToken, otherOrganizerToken, castingId, applicationId;

  beforeAll(async () => {
    await connectTestDb();
    if (mongoose.connection.readyState === 1) {
      // Scoped to this file's own fixtures, deleted in dependency order
      // (applications, then castings, then profiles, then users) — see the
      // identical fix/note in casting.test.js for why an unscoped
      // deleteMany({}) here is a latent cross-file race.
      const staleUsers = await User.find({ email: /@application-test\.local$/ }, '_id');
      const staleUserIds = staleUsers.map((u) => u._id);
      const staleModelProfiles = await ModelProfile.find({ userId: { $in: staleUserIds } }, '_id');
      const staleModelProfileIds = staleModelProfiles.map((p) => p._id);
      const staleIndustryProfiles = await IndustryProfile.find(
        { userId: { $in: staleUserIds } },
        '_id',
      );
      const staleIndustryProfileIds = staleIndustryProfiles.map((p) => p._id);
      const staleCastings = await CastingCall.find(
        { creatorProfileId: { $in: staleIndustryProfileIds } },
        '_id',
      );
      const staleCastingIds = staleCastings.map((c) => c._id);

      await Application.deleteMany({
        $or: [
          { modelProfileId: { $in: staleModelProfileIds } },
          { castingCallId: { $in: staleCastingIds } },
        ],
      });
      await CastingCall.deleteMany({ _id: { $in: staleCastingIds } });
      await ModelProfile.deleteMany({ userId: { $in: staleUserIds } });
      await IndustryProfile.deleteMany({ userId: { $in: staleUserIds } });
      await User.deleteMany({ email: /@application-test\.local$/ });
    }

    const regModel = await request(app).post('/api/auth/register').send({
      email: 'model@application-test.local',
      password: 'password123',
      role: 'model',
    });
    modelToken = regModel.body.token;
    await ModelProfile.create({
      userId: regModel.body.user.id,
      fullName: 'Test Model',
      country: 'LK',
      dateOfBirth: '2000-01-01',
      heightCm: 170,
      category: 'runway',
      representationStatus: 'freelance',
    });

    const regOrganizer = await request(app).post('/api/auth/register').send({
      email: 'organizer@application-test.local',
      password: 'password123',
      role: 'industry_professional',
    });
    organizerToken = regOrganizer.body.token;
    const organizerProfile = await IndustryProfile.create({
      userId: regOrganizer.body.user.id,
      organizationName: 'Studio',
      organizationType: 'agency',
      country: 'LK',
    });

    const regOtherOrganizer = await request(app).post('/api/auth/register').send({
      email: 'other-organizer@application-test.local',
      password: 'password123',
      role: 'industry_professional',
    });
    otherOrganizerToken = regOtherOrganizer.body.token;

    const casting = await CastingCall.create({
      creatorProfileId: organizerProfile._id,
      creatorType: 'industry_professional',
      title: 'Editorial Shoot',
      country: 'LK',
      category: 'editorial',
      description: 'x',
      applicationDeadline: new Date(Date.now() + 7 * 86400000),
    });
    castingId = casting._id.toString();
  });

  afterAll(async () => {
    await disconnectTestDb();
    server.close();
  });

  it('lets a model apply to an open casting call', async () => {
    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${modelToken}`)
      .send({ castingCallId: castingId });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.status).toBe('submitted');
    applicationId = res.body.data._id;
  });

  it('rejects a duplicate application to the same casting call', async () => {
    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${modelToken}`)
      .send({ castingCallId: castingId });

    expect(res.statusCode).toBe(409);
  });

  it('does not let an unrelated organizer update the application status', async () => {
    const res = await request(app)
      .patch(`/api/applications/${applicationId}/status`)
      .set('Authorization', `Bearer ${otherOrganizerToken}`)
      .send({ status: 'accepted' });

    expect(res.statusCode).toBe(403);

    const unchanged = await Application.findById(applicationId);
    expect(unchanged.status).toBe('submitted');
  });

  it('lets the casting owner accept the application', async () => {
    const res = await request(app)
      .patch(`/api/applications/${applicationId}/status`)
      .set('Authorization', `Bearer ${organizerToken}`)
      .send({ status: 'accepted' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('accepted');
  });

  it('rejects a model applying to a closed casting call', async () => {
    await CastingCall.findByIdAndUpdate(castingId, { status: 'closed' });

    const regModel2 = await request(app).post('/api/auth/register').send({
      email: 'model2@application-test.local',
      password: 'password123',
      role: 'model',
    });
    await ModelProfile.create({
      userId: regModel2.body.user.id,
      fullName: 'Test Model 2',
      country: 'LK',
      dateOfBirth: '2000-01-01',
      heightCm: 165,
      category: 'runway',
      representationStatus: 'freelance',
    });

    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${regModel2.body.token}`)
      .send({ castingCallId: castingId });

    expect(res.statusCode).toBe(409);
  });
});
