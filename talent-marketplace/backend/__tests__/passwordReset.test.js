const request = require('supertest');
const crypto = require('crypto');
const { app, server } = require('../server');
const mongoose = require('mongoose');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { connectTestDb, disconnectTestDb } = require('../testUtils/testDb');

jest.setTimeout(60000);

// NOTE on request counts: /api/auth is behind a tight rate limiter in
// server.js (max 10 requests / 15 min / IP), and that limiter's in-memory
// state lives for this whole file (a fresh module registry per test file
// means a fresh limiter, but it's still shared across every `it` below).
// Keep the total number of requests to /api/auth/* in this file under that
// limit — reuse responses/cookies across assertions instead of re-issuing
// calls that already happened.
describe('Password Reset API', () => {
  const testUser = {
    email: 'reset-user@password-reset-test.local',
    password: 'password123',
    role: 'model',
  };

  let oldRefreshCookie;

  beforeAll(async () => {
    await connectTestDb();
    if (mongoose.connection.readyState === 1) {
      // Scoped to this file's own fixtures — see casting.test.js for why an
      // unscoped deleteMany({}) is a latent cross-file race.
      const staleUsers = await User.find({ email: /@password-reset-test\.local$/ }, '_id');
      await RefreshToken.deleteMany({ user: { $in: staleUsers.map((u) => u._id) } });
      await User.deleteMany({ email: /@password-reset-test\.local$/ });
    }

    const reg = await request(app).post('/api/auth/register').send(testUser);
    // Registration also mints a refresh token (see sendTokenResponse in
    // authController.js) — reuse it as the "session that predates the
    // password reset" instead of spending an extra login call on it.
    oldRefreshCookie = reg.headers['set-cookie'].find((c) => c.startsWith('refreshToken='));
    expect(oldRefreshCookie).toBeDefined();
  });

  afterAll(async () => {
    await disconnectTestDb();
    server.close();
  });

  let existingEmailResponse;

  it('returns a generic 200 success message for an existing email', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: testUser.email });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.message).toBe('string');
    existingEmailResponse = res;
  });

  it('returns the identical response for a non-existent email (no account enumeration)', async () => {
    const nonExistentRes = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'nobody-here@password-reset-test.local' });

    expect(nonExistentRes.statusCode).toBe(existingEmailResponse.statusCode);
    expect(nonExistentRes.body).toEqual(existingEmailResponse.body);
  });

  it('rejects an invalid/expired reset token', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password/not-a-real-token')
      .send({ password: 'newpassword123' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('resets the password with a valid token, changes the effective login credential, and revokes pre-reset refresh tokens', async () => {
    // There's no real email inbox to read from in tests (and no SMTP is
    // configured), so — same as a real dev/local run without SMTP set up —
    // the reset link is only available via the console fallback in
    // backend/utils/email.js. Capture it there instead of guessing the
    // token (it's a random 32-byte value, not derivable any other way).
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const forgotRes = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: testUser.email });
    expect(forgotRes.statusCode).toBe(200);

    const logLine = logSpy.mock.calls
      .map((args) => args.join(' '))
      .find((line) => line.includes('Password reset link'));
    logSpy.mockRestore();
    expect(logLine).toBeDefined();

    const resetUrl = logLine.split(': ').slice(1).join(': ').trim();
    const plaintextToken = resetUrl.split('/reset-password/')[1];
    expect(plaintextToken).toBeTruthy();

    // Sanity-check: the token really is hashed (SHA-256) before storage, not
    // kept in plaintext, matching the RefreshToken.js convention.
    const storedUser = await User.findOne({ email: testUser.email }).select(
      '+resetPasswordTokenHash',
    );
    expect(storedUser.resetPasswordTokenHash).toBe(
      crypto.createHash('sha256').update(plaintextToken).digest('hex'),
    );

    const newPassword = 'newpassword456';
    const resetRes = await request(app)
      .post(`/api/auth/reset-password/${plaintextToken}`)
      .send({ password: newPassword });

    expect(resetRes.statusCode).toBe(200);
    expect(resetRes.body.success).toBe(true);

    // Old password no longer works.
    const oldLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    expect(oldLoginRes.statusCode).toBe(401);

    // New password works.
    const newLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: newPassword });
    expect(newLoginRes.statusCode).toBe(200);

    // Every refresh token issued before the reset — including the one
    // minted at registration — is now revoked.
    const rawOldToken = oldRefreshCookie.split(';')[0].split('=')[1];
    const hashedOldToken = crypto.createHash('sha256').update(rawOldToken).digest('hex');
    const oldTokenDoc = await RefreshToken.findOne({ token: hashedOldToken });
    expect(oldTokenDoc.revoked).toBeTruthy();

    // Confirm the effect end-to-end: refreshing with the pre-reset cookie
    // now fails, so a stolen session doesn't survive a password reset.
    const refreshRes = await request(app).post('/api/auth/refresh').set('Cookie', oldRefreshCookie);
    expect(refreshRes.statusCode).toBe(401);
  });
});
