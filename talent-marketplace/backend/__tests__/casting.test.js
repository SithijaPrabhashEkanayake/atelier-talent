const request = require('supertest');
const { app, server } = require('../server');
const mongoose = require('mongoose');
const User = require('../models/User');
const IndustryProfile = require('../models/IndustryProfile');
const CastingCall = require('../models/CastingCall');
const { connectTestDb, disconnectTestDb } = require('../testUtils/testDb');

jest.setTimeout(60000);

describe('Casting Call API — ownership & authorization', () => {
  let organizerAToken, organizerBToken, modelToken, castingId;

  beforeAll(async () => {
    await connectTestDb();
    if (mongoose.connection.readyState === 1) {
      // Scoped to this file's own fixtures only, and deleted in dependency
      // order (castings before profiles before users) — an unscoped
      // deleteMany({}) here would wipe every IndustryProfile/CastingCall in
      // the shared test database, including fixtures another test file's
      // run left behind. Currently masked by `--runInBand` (test files run
      // one at a time), but that's fragile: drop that flag later for speed
      // and this becomes a real cross-file race again.
      const staleUsers = await User.find({ email: /@casting-test\.local$/ }, '_id');
      const staleUserIds = staleUsers.map((u) => u._id);
      const staleProfiles = await IndustryProfile.find({ userId: { $in: staleUserIds } }, '_id');
      const staleProfileIds = staleProfiles.map((p) => p._id);
      await CastingCall.deleteMany({ creatorProfileId: { $in: staleProfileIds } });
      await IndustryProfile.deleteMany({ userId: { $in: staleUserIds } });
      await User.deleteMany({ email: /@casting-test\.local$/ });
    }

    // Organizer A
    const regA = await request(app).post('/api/auth/register').send({
      email: 'organizerA@casting-test.local',
      password: 'password123',
      role: 'industry_professional',
    });
    organizerAToken = regA.body.token;
    await IndustryProfile.create({
      userId: regA.body.user.id,
      organizationName: 'Studio A',
      organizationType: 'agency',
      country: 'LK',
    });

    // Organizer B (a different account, same role)
    const regB = await request(app).post('/api/auth/register').send({
      email: 'organizerB@casting-test.local',
      password: 'password123',
      role: 'industry_professional',
    });
    organizerBToken = regB.body.token;
    await IndustryProfile.create({
      userId: regB.body.user.id,
      organizationName: 'Studio B',
      organizationType: 'agency',
      country: 'LK',
    });

    // A model account (should not be able to create castings)
    const regM = await request(app).post('/api/auth/register').send({
      email: 'model@casting-test.local',
      password: 'password123',
      role: 'model',
    });
    modelToken = regM.body.token;
  });

  afterAll(async () => {
    await disconnectTestDb();
    server.close();
  });

  it('lets an industry professional create a casting call', async () => {
    const res = await request(app)
      .post('/api/castings')
      .set('Authorization', `Bearer ${organizerAToken}`)
      .send({
        title: 'Runway Show',
        country: 'LK',
        category: 'runway',
        description: 'A show',
        applicationDeadline: new Date(Date.now() + 7 * 86400000).toISOString(),
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.status).toBe('open');
    castingId = res.body.data._id;
  });

  it('rejects a model trying to create a casting call', async () => {
    const res = await request(app)
      .post('/api/castings')
      .set('Authorization', `Bearer ${modelToken}`)
      .send({
        title: 'x',
        country: 'LK',
        category: 'runway',
        description: 'x',
        applicationDeadline: new Date().toISOString(),
      });

    expect(res.statusCode).toBe(403);
  });

  it("does not let a non-owner organizer update someone else's casting call", async () => {
    const res = await request(app)
      .put(`/api/castings/${castingId}`)
      .set('Authorization', `Bearer ${organizerBToken}`)
      .send({ title: 'Hijacked title' });

    expect(res.statusCode).toBe(403);

    const stillOriginal = await CastingCall.findById(castingId);
    expect(stillOriginal.title).toBe('Runway Show');
  });

  it('ignores an attempt to smuggle status/ownership fields through the update payload', async () => {
    const res = await request(app)
      .put(`/api/castings/${castingId}`)
      .set('Authorization', `Bearer ${organizerAToken}`)
      .send({ title: 'Runway Show — Updated', status: 'closed', creatorType: 'pageant_organizer' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.title).toBe('Runway Show — Updated');
    expect(res.body.data.status).toBe('open'); // unaffected by the smuggled field
    expect(res.body.data.creatorType).toBe('industry_professional'); // unaffected
  });

  it('does not let a non-owner organizer close the casting call', async () => {
    const res = await request(app)
      .patch(`/api/castings/${castingId}/close`)
      .set('Authorization', `Bearer ${organizerBToken}`);

    expect(res.statusCode).toBe(403);
  });

  it('lets the owner close their own casting call', async () => {
    const res = await request(app)
      .patch(`/api/castings/${castingId}/close`)
      .set('Authorization', `Bearer ${organizerAToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('closed');
  });
});
