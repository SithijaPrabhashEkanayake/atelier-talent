const request = require('supertest');
const { app, server } = require('../server');
const mongoose = require('mongoose');
const User = require('../models/User');
const { connectTestDb, disconnectTestDb } = require('../testUtils/testDb');

jest.setTimeout(60000);

describe('Admin Analytics & Telemetry API', () => {
  let adminToken, regularModelToken;

  beforeAll(async () => {
    await connectTestDb();
    if (mongoose.connection.readyState === 1) {
      await User.deleteMany({ email: /@analytics-test\.local$/ });
    }

    await User.create({
      email: 'admin@analytics-test.local',
      password: 'password123',
      role: 'admin',
    });
    const adminLogin = await request(app).post('/api/auth/login').send({
      email: 'admin@analytics-test.local',
      password: 'password123',
    });
    adminToken = adminLogin.body.token;

    const regModel = await request(app).post('/api/auth/register').send({
      email: 'model@analytics-test.local',
      password: 'password123',
      role: 'model',
    });
    regularModelToken = regModel.body.token;
  });

  afterAll(async () => {
    await disconnectTestDb();
    server.close();
  });

  it('blocks non-admin users from viewing platform analytics with 403', async () => {
    const res = await request(app)
      .get('/api/admin/analytics/overview')
      .set('Authorization', `Bearer ${regularModelToken}`);

    expect(res.statusCode).toBe(403);
  });

  it('allows admin to fetch overview analytics and time series', async () => {
    const res = await request(app)
      .get('/api/admin/analytics/overview?days=7')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('totals');
    expect(res.body.data.totals).toHaveProperty('users');
    expect(res.body.data.totals).toHaveProperty('castings');
    expect(res.body.data).toHaveProperty('timeSeries');
    expect(Array.isArray(res.body.data.timeSeries)).toBe(true);
    expect(res.body.data.timeSeries.length).toBe(7);
  });

  it('allows admin to fetch demographic distributions', async () => {
    const res = await request(app)
      .get('/api/admin/analytics/demographics')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('roleDistribution');
    expect(Array.isArray(res.body.data.roleDistribution)).toBe(true);
    expect(res.body.data).toHaveProperty('topCountries');
  });

  it('allows admin to fetch engagement metrics and funnel', async () => {
    const res = await request(app)
      .get('/api/admin/analytics/engagement')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('applicationFunnel');
    expect(res.body.data).toHaveProperty('metrics');
    expect(res.body.data.metrics).toHaveProperty('acceptanceRate');
  });
});
