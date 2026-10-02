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

describe('Matching API — rule-based recommendations & scoring', () => {
  let organizerToken, otherOrganizerToken, castingId;
  let goodModelToken, poorModelToken;

  beforeAll(async () => {
    await connectTestDb();
    if (mongoose.connection.readyState === 1) {
      // Scoped to this file's own fixtures only, deleted in dependency
      // order — same pattern as application.test.js / casting.test.js.
      const staleUsers = await User.find({ email: /@matching-test\.local$/ }, '_id');
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
      await User.deleteMany({ email: /@matching-test\.local$/ });
    }

    // Casting owner
    const regOrganizer = await request(app).post('/api/auth/register').send({
      email: 'organizer@matching-test.local',
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

    // A different organizer, used to prove recommendations are ownership-scoped
    const regOther = await request(app).post('/api/auth/register').send({
      email: 'other-organizer@matching-test.local',
      password: 'password123',
      role: 'industry_professional',
    });
    otherOrganizerToken = regOther.body.token;

    // Casting call with age/height/category/country/skills all specified
    const casting = await CastingCall.create({
      creatorProfileId: organizerProfile._id,
      creatorType: 'industry_professional',
      title: 'Runway Show',
      country: 'LK',
      category: 'runway',
      criteria: {
        minAge: 20,
        maxAge: 30,
        minHeightCm: 165,
        maxHeightCm: 180,
        requiredSkills: ['catwalk', 'posing'],
      },
      description: 'x',
      applicationDeadline: new Date(Date.now() + 7 * 86400000),
    });
    castingId = casting._id.toString();

    // A model that matches every dimension (age ~25, height 170, runway, LK, both skills)
    const regGoodModel = await request(app).post('/api/auth/register').send({
      email: 'good-model@matching-test.local',
      password: 'password123',
      role: 'model',
    });
    goodModelToken = regGoodModel.body.token;
    await ModelProfile.create({
      userId: regGoodModel.body.user.id,
      fullName: 'Good Fit',
      country: 'LK',
      dateOfBirth: new Date(new Date().getFullYear() - 25, 0, 1),
      heightCm: 170,
      category: 'runway',
      representationStatus: 'freelance',
      skills: ['catwalk', 'posing'],
      isPublished: true,
    });

    // A model that matches almost nothing (wrong age, wrong height, wrong
    // category, wrong country, no matching skills)
    const regPoorModel = await request(app).post('/api/auth/register').send({
      email: 'poor-model@matching-test.local',
      password: 'password123',
      role: 'model',
    });
    poorModelToken = regPoorModel.body.token;
    await ModelProfile.create({
      userId: regPoorModel.body.user.id,
      fullName: 'Poor Fit',
      country: 'US',
      dateOfBirth: new Date(new Date().getFullYear() - 50, 0, 1),
      heightCm: 150,
      category: 'commercial',
      representationStatus: 'freelance',
      skills: ['acting'],
      isPublished: true,
    });

    // Apply both models to the casting so getApplicants has data to enrich
    await Application.create({
      castingCallId: castingId,
      modelProfileId: (await ModelProfile.findOne({ userId: regGoodModel.body.user.id }))._id,
    });
    await Application.create({
      castingCallId: castingId,
      modelProfileId: (await ModelProfile.findOne({ userId: regPoorModel.body.user.id }))._id,
    });
  });

  afterAll(async () => {
    await disconnectTestDb();
    server.close();
  });

  it('lets the casting owner get ranked recommendations, best-fit profile first', async () => {
    const res = await request(app)
      .get(`/api/castings/${castingId}/recommendations`)
      .set('Authorization', `Bearer ${organizerToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);

    const goodEntry = res.body.data.find((r) => r.modelProfile.fullName === 'Good Fit');
    const poorEntry = res.body.data.find((r) => r.modelProfile.fullName === 'Poor Fit');
    expect(goodEntry).toBeDefined();
    expect(poorEntry).toBeDefined();
    expect(goodEntry.score).toBeGreaterThan(poorEntry.score);
    expect(goodEntry.score).toBe(100);
    // Results are sorted descending by score
    expect(res.body.data[0].score).toBe(Math.max(...res.body.data.map((r) => r.score)));
    expect(goodEntry.breakdown).toHaveProperty('age');
    expect(goodEntry.breakdown).toHaveProperty('skills');
  });

  it("forbids a non-owner organizer from viewing another organizer's recommendations", async () => {
    const res = await request(app)
      .get(`/api/castings/${castingId}/recommendations`)
      .set('Authorization', `Bearer ${otherOrganizerToken}`);

    expect(res.statusCode).toBe(403);
  });

  it('lets a model get recommended open castings that fit their profile', async () => {
    const res = await request(app)
      .get('/api/match/recommendations/castings')
      .set('Authorization', `Bearer ${goodModelToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    const entry = res.body.data.find((r) => r.castingCall._id === castingId);
    expect(entry).toBeDefined();
    expect(entry.score).toBe(100);
  });

  it('gives a lower score to the poor-fit model for the same casting', async () => {
    const res = await request(app)
      .get('/api/match/recommendations/castings')
      .set('Authorization', `Bearer ${poorModelToken}`);

    expect(res.statusCode).toBe(200);
    const entry = res.body.data.find((r) => r.castingCall._id === castingId);
    expect(entry).toBeDefined();
    expect(entry.score).toBeLessThan(100);
  });

  it('includes a matchScore per applicant in getApplicants, best-fit ranked appropriately', async () => {
    const res = await request(app)
      .get(`/api/castings/${castingId}/applicants`)
      .set('Authorization', `Bearer ${organizerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(2);
    for (const applicant of res.body.data) {
      expect(applicant).toHaveProperty('matchScore');
      expect(typeof applicant.matchScore).toBe('number');
      expect(applicant).toHaveProperty('matchBreakdown');
    }

    const goodApplicant = res.body.data.find((a) => a.modelProfileId.fullName === 'Good Fit');
    const poorApplicant = res.body.data.find((a) => a.modelProfileId.fullName === 'Poor Fit');
    expect(goodApplicant.matchScore).toBeGreaterThan(poorApplicant.matchScore);
  });
});
