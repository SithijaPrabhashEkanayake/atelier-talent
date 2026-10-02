const request = require('supertest');
const { app, server } = require('../server');
const mongoose = require('mongoose');
const User = require('../models/User');
const ModelProfile = require('../models/ModelProfile');
const { connectTestDb, disconnectTestDb } = require('../testUtils/testDb');

jest.setTimeout(60000);

describe('Profile API — self-update whitelist & publish-gated visibility', () => {
  let modelToken, modelUserId, strangerToken;

  beforeAll(async () => {
    await connectTestDb();
    if (mongoose.connection.readyState === 1) {
      // Scoped to this file's own fixtures — see casting.test.js for why an
      // unscoped deleteMany({}) is a latent cross-file race.
      const staleUsers = await User.find({ email: /@profile-test\.local$/ }, '_id');
      await ModelProfile.deleteMany({ userId: { $in: staleUsers.map((u) => u._id) } });
      await User.deleteMany({ email: /@profile-test\.local$/ });
    }

    const reg = await request(app).post('/api/auth/register').send({
      email: 'model@profile-test.local',
      password: 'password123',
      role: 'model',
    });
    modelToken = reg.body.token;
    modelUserId = reg.body.user.id;

    const regStranger = await request(app).post('/api/auth/register').send({
      email: 'stranger@profile-test.local',
      password: 'password123',
      role: 'model',
    });
    strangerToken = regStranger.body.token;
  });

  afterAll(async () => {
    await disconnectTestDb();
    server.close();
  });

  it('lets a model create/update their own profile via PUT /profiles/me', async () => {
    const res = await request(app)
      .put('/api/profiles/me')
      .set('Authorization', `Bearer ${modelToken}`)
      .send({
        fullName: 'Jane Doe',
        country: 'LK',
        dateOfBirth: '1998-05-01',
        heightCm: 172,
        category: 'runway',
        representationStatus: 'freelance',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.fullName).toBe('Jane Doe');
    expect(res.body.data.isVerified).toBe(false);
  });

  it('ignores a self-submitted isVerified: true — verification stays admin-only', async () => {
    const res = await request(app)
      .put('/api/profiles/me')
      .set('Authorization', `Bearer ${modelToken}`)
      .send({ fullName: 'Jane Doe', isVerified: true });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.isVerified).toBe(false);

    const stored = await ModelProfile.findOne({ userId: modelUserId });
    expect(stored.isVerified).toBe(false);
  });

  it('ignores an attempt to reassign the profile to another user via a smuggled userId', async () => {
    const res = await request(app)
      .put('/api/profiles/me')
      .set('Authorization', `Bearer ${modelToken}`)
      .send({ fullName: 'Jane Doe', userId: '000000000000000000000000' });

    expect(res.statusCode).toBe(200);
    const stored = await ModelProfile.findOne({ userId: modelUserId });
    expect(stored).not.toBeNull();
    expect(stored.userId.toString()).toBe(modelUserId);
  });

  it('hides an unpublished profile from a stranger (404, not 403 — avoids confirming it exists)', async () => {
    const mine = await ModelProfile.findOne({ userId: modelUserId });
    expect(mine.isPublished).toBe(false); // default, never published in this test

    const res = await request(app)
      .get(`/api/profiles/${mine._id}`)
      .set('Authorization', `Bearer ${strangerToken}`);

    expect(res.statusCode).toBe(404);
  });

  it('still lets the owner view their own unpublished profile', async () => {
    const mine = await ModelProfile.findOne({ userId: modelUserId });

    const res = await request(app)
      .get(`/api/profiles/${mine._id}`)
      .set('Authorization', `Bearer ${modelToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.fullName).toBe('Jane Doe');
  });

  it('exposes an unpublished profile once the owner publishes it', async () => {
    await request(app)
      .put('/api/profiles/me')
      .set('Authorization', `Bearer ${modelToken}`)
      .send({ fullName: 'Jane Doe', isPublished: true });

    const mine = await ModelProfile.findOne({ userId: modelUserId });
    const res = await request(app)
      .get(`/api/profiles/${mine._id}`)
      .set('Authorization', `Bearer ${strangerToken}`);

    expect(res.statusCode).toBe(200);
  });
});
