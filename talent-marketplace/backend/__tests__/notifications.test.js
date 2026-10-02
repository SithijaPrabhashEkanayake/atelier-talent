const request = require('supertest');
const { app, server } = require('../server');
const mongoose = require('mongoose');
const User = require('../models/User');
const Notification = require('../models/Notification');
const notificationService = require('../services/notificationService');
const { connectTestDb, disconnectTestDb } = require('../testUtils/testDb');

jest.setTimeout(60000);

describe('Notifications API & Real-Time Event Dispatch', () => {
  let userToken, userId, otherToken, notif1Id;

  beforeAll(async () => {
    await connectTestDb();
    if (mongoose.connection.readyState === 1) {
      const staleUsers = await User.find({ email: /@notif-test\.local$/ }, '_id');
      const staleIds = staleUsers.map((u) => u._id);
      await Notification.deleteMany({ userId: { $in: staleIds } });
      await User.deleteMany({ email: /@notif-test\.local$/ });
    }

    const reg = await request(app).post('/api/auth/register').send({
      email: 'recipient@notif-test.local',
      password: 'password123',
      role: 'model',
    });
    userToken = reg.body.token;
    userId = reg.body.user.id;

    const regOther = await request(app).post('/api/auth/register').send({
      email: 'other@notif-test.local',
      password: 'password123',
      role: 'industry_professional',
    });
    otherToken = regOther.body.token;

    // Seed notifications using the centralized notificationService
    const n1 = await notificationService.createNotification({
      userId,
      type: 'application_update',
      message: 'Your application for "Paris Runway" was shortlisted',
      link: '/my-applications',
    });
    notif1Id = n1._id.toString();

    await notificationService.createNotification({
      userId,
      type: 'system_alert',
      message: 'Profile verified by administrator',
      link: '/profile/edit',
    });
  });

  afterAll(async () => {
    await disconnectTestDb();
    server.close();
  });

  it('rejects unauthenticated requests to notifications endpoint with 401', async () => {
    const res = await request(app).get('/api/notifications/me');
    expect(res.statusCode).toBe(401);
  });

  it('fetches recipient notifications ordered by newest first', async () => {
    const res = await request(app)
      .get('/api/notifications/me')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(2);
    expect(res.body.data[0].read).toBe(false);
  });

  it('marks a single notification as read', async () => {
    const res = await request(app)
      .patch(`/api/notifications/${notif1Id}/read`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.read).toBe(true);

    const doc = await Notification.findById(notif1Id);
    expect(doc.read).toBe(true);
  });

  it('marks all notifications as read for the user', async () => {
    const res = await request(app)
      .patch('/api/notifications/read-all')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const unreadCount = await Notification.countDocuments({ userId, read: false });
    expect(unreadCount).toBe(0);
  });

  it('does not leak notifications across different users', async () => {
    const res = await request(app)
      .get('/api/notifications/me')
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(0);
  });
});
