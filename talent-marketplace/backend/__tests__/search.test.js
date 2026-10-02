const request = require('supertest');
const { app, server } = require('../server');
const mongoose = require('mongoose');
const User = require('../models/User');
const ModelProfile = require('../models/ModelProfile');
const { connectTestDb, disconnectTestDb } = require('../testUtils/testDb');

jest.setTimeout(60000);

describe('Talent Search API — multi-attribute filtering & RBAC protection', () => {
  let scoutToken, modelToken;

  beforeAll(async () => {
    await connectTestDb();
    if (mongoose.connection.readyState === 1) {
      const staleUsers = await User.find({ email: /@search-test\.local$/ }, '_id');
      await ModelProfile.deleteMany({ userId: { $in: staleUsers.map((u) => u._id) } });
      await User.deleteMany({ email: /@search-test\.local$/ });
    }

    // Recruiter / Industry Scout
    const regScout = await request(app).post('/api/auth/register').send({
      email: 'scout@search-test.local',
      password: 'password123',
      role: 'industry_professional',
    });
    scoutToken = regScout.body.token;

    // Regular Model user (for proving RBAC exclusion)
    const regModel = await request(app).post('/api/auth/register').send({
      email: 'viewer@search-test.local',
      password: 'password123',
      role: 'model',
    });
    modelToken = regModel.body.token;

    // Published Model 1: Runway, France, 180cm
    const u1 = await User.create({
      email: 'm1@search-test.local',
      password: 'password123',
      role: 'model',
    });
    await ModelProfile.create({
      userId: u1._id,
      fullName: 'Aria Dubois',
      category: 'runway',
      country: 'France',
      dateOfBirth: new Date('1999-05-12'),
      representationStatus: 'freelance',
      heightCm: 180,
      skills: ['catwalk', 'high-fashion'],
      isPublished: true,
    });

    // Published Model 2: Commercial, France, 168cm
    const u2 = await User.create({
      email: 'm2@search-test.local',
      password: 'password123',
      role: 'model',
    });
    await ModelProfile.create({
      userId: u2._id,
      fullName: 'Camille Laurent',
      category: 'commercial',
      country: 'France',
      dateOfBirth: new Date('2001-08-20'),
      representationStatus: 'freelance',
      heightCm: 168,
      skills: ['commercial', 'acting'],
      isPublished: true,
    });

    // Unpublished Model: Editorial, France, 175cm (Draft mode)
    const u3 = await User.create({
      email: 'm3@search-test.local',
      password: 'password123',
      role: 'model',
    });
    await ModelProfile.create({
      userId: u3._id,
      fullName: 'Hidden Talent',
      category: 'editorial',
      country: 'France',
      dateOfBirth: new Date('2002-03-15'),
      representationStatus: 'freelance',
      heightCm: 175,
      isPublished: false,
    });
  });

  afterAll(async () => {
    await disconnectTestDb();
    server.close();
  });

  it('rejects unauthenticated requests to scout talent search with 401', async () => {
    const res = await request(app).get('/api/search/talent');
    expect(res.statusCode).toBe(401);
  });

  it('forbids model role from accessing recruiter scout search with 403', async () => {
    const res = await request(app)
      .get('/api/search/talent?country=France')
      .set('Authorization', `Bearer ${modelToken}`);
    expect(res.statusCode).toBe(403);
  });

  it('returns 400 validation error if country is missing', async () => {
    const res = await request(app)
      .get('/api/search/talent')
      .set('Authorization', `Bearer ${scoutToken}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.errorCode).toBe('VALIDATION_ERROR');
  });

  it('allows recruiter to search talent directory by country and only returns published profiles', async () => {
    const res = await request(app)
      .get('/api/search/talent?country=France')
      .set('Authorization', `Bearer ${scoutToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);

    const names = res.body.data.map((p) => p.fullName);
    expect(names).toContain('Aria Dubois');
    expect(names).toContain('Camille Laurent');
    expect(names).not.toContain('Hidden Talent');
  });

  it('filters talent by category within country', async () => {
    const res = await request(app)
      .get('/api/search/talent?country=France&category=runway')
      .set('Authorization', `Bearer ${scoutToken}`);

    expect(res.statusCode).toBe(200);
    const names = res.body.data.map((p) => p.fullName);
    expect(names).toContain('Aria Dubois');
    expect(names).not.toContain('Camille Laurent');
  });

  it('filters talent by minimum height threshold (minHeightCm)', async () => {
    const res = await request(app)
      .get('/api/search/talent?country=France&minHeightCm=175')
      .set('Authorization', `Bearer ${scoutToken}`);

    expect(res.statusCode).toBe(200);
    const names = res.body.data.map((p) => p.fullName);
    expect(names).toContain('Aria Dubois'); // 180cm
    expect(names).not.toContain('Camille Laurent'); // 168cm
  });

  it('filters talent by skills overlap', async () => {
    const res = await request(app)
      .get('/api/search/talent?country=France&skills=acting')
      .set('Authorization', `Bearer ${scoutToken}`);

    expect(res.statusCode).toBe(200);
    const names = res.body.data.map((p) => p.fullName);
    expect(names).toContain('Camille Laurent');
    expect(names).not.toContain('Aria Dubois');
  });
});
