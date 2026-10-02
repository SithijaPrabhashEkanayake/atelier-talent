const request = require('supertest');
const { app, server } = require('../server');
const mongoose = require('mongoose');
const User = require('../models/User');
const IndustryProfile = require('../models/IndustryProfile');
const CastingCall = require('../models/CastingCall');
const Report = require('../models/Report');
const AdminActionLog = require('../models/AdminActionLog');
const { connectTestDb, disconnectTestDb } = require('../testUtils/testDb');

jest.setTimeout(60000);

describe('Admin moderation API', () => {
  let adminToken,
    adminId,
    regularToken,
    regularId,
    targetToken,
    targetId,
    organizerToken,
    castingId;

  beforeAll(async () => {
    await connectTestDb();
    if (mongoose.connection.readyState === 1) {
      // Scoped to this file's own fixtures only, deleted in dependency order
      // — see the identical note in casting.test.js.
      const staleUsers = await User.find({ email: /@admin-mod-test\.local$/ }, '_id');
      const staleUserIds = staleUsers.map((u) => u._id);
      const staleProfiles = await IndustryProfile.find({ userId: { $in: staleUserIds } }, '_id');
      const staleProfileIds = staleProfiles.map((p) => p._id);
      await Report.deleteMany({ reporterId: { $in: staleUserIds } });
      await AdminActionLog.deleteMany({ adminId: { $in: staleUserIds } });
      await CastingCall.deleteMany({ creatorProfileId: { $in: staleProfileIds } });
      await IndustryProfile.deleteMany({ userId: { $in: staleUserIds } });
      await User.deleteMany({ email: /@admin-mod-test\.local$/ });
    }

    // Admin account — 'admin' is blocked from public self-registration
    // (authController.PUBLIC_REGISTRATION_ROLES), so create it directly via
    // the User model instead of POST /api/auth/register. The pre('save')
    // hook still hashes the password on User.create().
    const adminUser = await User.create({
      email: 'admin@admin-mod-test.local',
      password: 'password123',
      role: 'admin',
    });
    adminId = adminUser._id.toString();
    const adminLogin = await request(app).post('/api/auth/login').send({
      email: 'admin@admin-mod-test.local',
      password: 'password123',
    });
    adminToken = adminLogin.body.token;

    // A regular (non-admin) user, used both to prove 403s and as a
    // suspend/reactivate target.
    const regTarget = await request(app).post('/api/auth/register').send({
      email: 'target@admin-mod-test.local',
      password: 'password123',
      role: 'model',
    });
    targetToken = regTarget.body.token;
    targetId = regTarget.body.user.id;

    const regRegular = await request(app).post('/api/auth/register').send({
      email: 'regular@admin-mod-test.local',
      password: 'password123',
      role: 'model',
    });
    regularToken = regRegular.body.token;
    regularId = regRegular.body.user.id;

    // An organizer + casting call, to exercise casting removal/restore.
    const regOrganizer = await request(app).post('/api/auth/register').send({
      email: 'organizer@admin-mod-test.local',
      password: 'password123',
      role: 'industry_professional',
    });
    organizerToken = regOrganizer.body.token;
    await IndustryProfile.create({
      userId: regOrganizer.body.user.id,
      organizationName: 'Mod Test Studio',
      organizationType: 'agency',
      country: 'LK',
    });

    const castingRes = await request(app)
      .post('/api/castings')
      .set('Authorization', `Bearer ${organizerToken}`)
      .send({
        title: 'Moderated Show',
        country: 'LK',
        category: 'runway',
        description: 'A show',
        applicationDeadline: new Date(Date.now() + 7 * 86400000).toISOString(),
      });
    castingId = castingRes.body.data._id;
  });

  afterAll(async () => {
    await disconnectTestDb();
    server.close();
  });

  describe('authorization', () => {
    it('rejects a non-admin on every new admin endpoint', async () => {
      const endpoints = [
        () => request(app).get('/api/admin/users').set('Authorization', `Bearer ${regularToken}`),
        () =>
          request(app)
            .patch(`/api/admin/users/${targetId}/suspend`)
            .set('Authorization', `Bearer ${regularToken}`),
        () =>
          request(app)
            .patch(`/api/admin/users/${targetId}/reactivate`)
            .set('Authorization', `Bearer ${regularToken}`),
        () =>
          request(app)
            .patch(`/api/admin/castings/${castingId}/remove`)
            .set('Authorization', `Bearer ${regularToken}`),
        () =>
          request(app)
            .patch(`/api/admin/castings/${castingId}/restore`)
            .set('Authorization', `Bearer ${regularToken}`),
        () => request(app).get('/api/admin/reports').set('Authorization', `Bearer ${regularToken}`),
        () =>
          request(app)
            .patch('/api/admin/reports/000000000000000000000000')
            .set('Authorization', `Bearer ${regularToken}`)
            .send({ status: 'reviewed' }),
        () => request(app).get('/api/admin/logs').set('Authorization', `Bearer ${regularToken}`),
      ];

      for (const call of endpoints) {
        const res = await call();
        expect(res.statusCode).toBe(403);
      }
    });
  });

  describe('user management', () => {
    it('lets an admin suspend a user, and that user is then rejected on login', async () => {
      const res = await request(app)
        .patch(`/api/admin/users/${targetId}/suspend`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe('Suspended');

      const loginRes = await request(app).post('/api/auth/login').send({
        email: 'target@admin-mod-test.local',
        password: 'password123',
      });
      expect(loginRes.statusCode).toBe(403);
    });

    it('lets an admin reactivate a suspended user', async () => {
      const res = await request(app)
        .patch(`/api/admin/users/${targetId}/reactivate`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe('Active');

      const loginRes = await request(app).post('/api/auth/login').send({
        email: 'target@admin-mod-test.local',
        password: 'password123',
      });
      expect(loginRes.statusCode).toBe(200);
    });

    it('does not let an admin suspend their own account', async () => {
      const res = await request(app)
        .patch(`/api/admin/users/${adminId}/suspend`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(400);

      const stillAdmin = await User.findById(adminId);
      expect(stillAdmin.status).toBe('Active');
    });

    it('lists users, excluding the password field', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].password).toBeUndefined();
    });
  });

  describe('casting call moderation', () => {
    it('lets an admin remove a casting call, hiding it from the public list but not from admins', async () => {
      const removeRes = await request(app)
        .patch(`/api/admin/castings/${castingId}/remove`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(removeRes.statusCode).toBe(200);
      expect(removeRes.body.data.isRemovedByAdmin).toBe(true);

      // Public list (non-admin, default status=open) no longer includes it.
      const publicList = await request(app)
        .get('/api/castings')
        .set('Authorization', `Bearer ${targetToken}`);
      expect(publicList.statusCode).toBe(200);
      expect(publicList.body.data.find((c) => c._id === castingId)).toBeUndefined();

      // Non-admin detail view 404s.
      const publicDetail = await request(app)
        .get(`/api/castings/${castingId}`)
        .set('Authorization', `Bearer ${targetToken}`);
      expect(publicDetail.statusCode).toBe(404);

      // Admin list still includes it.
      const adminList = await request(app)
        .get('/api/castings')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(adminList.statusCode).toBe(200);
      expect(adminList.body.data.find((c) => c._id === castingId)).toBeDefined();

      // Admin detail view still works.
      const adminDetail = await request(app)
        .get(`/api/castings/${castingId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(adminDetail.statusCode).toBe(200);
    });

    it('lets an admin restore a removed casting call', async () => {
      const restoreRes = await request(app)
        .patch(`/api/admin/castings/${castingId}/restore`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(restoreRes.statusCode).toBe(200);
      expect(restoreRes.body.data.isRemovedByAdmin).toBe(false);

      const publicList = await request(app)
        .get('/api/castings')
        .set('Authorization', `Bearer ${targetToken}`);
      expect(publicList.body.data.find((c) => c._id === castingId)).toBeDefined();
    });
  });

  describe('reports', () => {
    let reportId;

    it('lets a regular user file a report', async () => {
      const res = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({
          targetType: 'casting_call',
          targetId: castingId,
          reason: 'Looks like a scam listing',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.status).toBe('open');
      expect(res.body.data.reporterId).toBe(regularId);
      reportId = res.body.data._id;
    });

    it('lists reports for an admin, populated with reporter email', async () => {
      const res = await request(app)
        .get('/api/admin/reports')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      const found = res.body.data.find((r) => r._id === reportId);
      expect(found).toBeDefined();
      expect(found.reporterId.email).toBe('regular@admin-mod-test.local');
    });

    it('lets an admin resolve a report', async () => {
      const res = await request(app)
        .patch(`/api/admin/reports/${reportId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'reviewed' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe('reviewed');
    });

    it('rejects an invalid status value', async () => {
      const res = await request(app)
        .patch(`/api/admin/reports/${reportId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'not-a-real-status' });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('admin action log', () => {
    it('records an entry for a moderation action (e.g. suspend/reactivate/report resolution)', async () => {
      const res = await request(app)
        .get('/api/admin/logs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      const actions = res.body.data.map((l) => l.action);
      expect(actions).toEqual(expect.arrayContaining(['report.resolve']));
    });
  });
});
