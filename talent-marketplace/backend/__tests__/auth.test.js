const request = require('supertest');
const { app, server } = require('../server');
const mongoose = require('mongoose');
const User = require('../models/User');
const { connectTestDb, disconnectTestDb } = require('../testUtils/testDb');

jest.setTimeout(60000);

describe('Auth API', () => {
  beforeAll(async () => {
    await connectTestDb();
    if (mongoose.connection.readyState === 1) {
      // Scoped to this file's own test user only — an unscoped deleteMany({})
      // here wiped the ENTIRE users collection, including accounts other
      // test files (casting.test.js, application.test.js, profile.test.js)
      // had just created against the same shared database. Jest runs test
      // files in parallel workers by default, so this was a real,
      // reproducible source of cross-file test flakiness, not a hypothetical.
      await User.deleteMany({ email: 'test@example.com' });
    }
  });

  afterAll(async () => {
    await disconnectTestDb();
    server.close();
  });

  const testUser = {
    email: 'test@example.com',
    password: 'password123',
    role: 'model',
  };

  it('should register a new user', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email);
  });

  it('should not register user with existing email', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
  });

  it('should login the user', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  it('should not login with wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: 'wrongpassword',
    });

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toBe(false);
  });
});
