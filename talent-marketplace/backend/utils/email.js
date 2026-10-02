// Thin email-sending wrapper used by the password-reset flow.
//
// There is no SMTP/email provider configured anywhere in this project by
// default (no SendGrid/nodemailer credentials in .env). Rather than make the
// whole forgot-password feature unusable/untestable without that setup, this
// module falls back to logging the reset link to the console whenever
// SMTP_HOST/SMTP_USER/SMTP_PASS aren't all present — that keeps the feature
// fully functional in dev/test out of the box. Once real SMTP env vars are
// supplied, it switches to actually sending mail via nodemailer with no
// other code changes required.
const isSmtpConfigured = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

// Lazily require nodemailer only when SMTP is actually configured, so the
// dependency is never touched (and doesn't need to be installed) in the
// common no-SMTP dev/test path.
const buildTransport = () => {
  const nodemailer = require('nodemailer');
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// @desc  "Send" a password-reset email containing resetUrl to toEmail.
//        Uses real SMTP via nodemailer when configured; otherwise logs the
//        link to the console so the flow is fully usable/testable without
//        any email setup (see module comment above).
const sendPasswordResetEmail = async (toEmail, resetUrl) => {
  if (!isSmtpConfigured()) {
    // DEV FALLBACK — no SMTP_HOST/SMTP_USER/SMTP_PASS configured. This is
    // the expected/default state for local dev and tests.
    console.log(`[DEV] Password reset link for ${toEmail}: ${resetUrl}`);
    return { delivered: false, method: 'console' };
  }

  const transport = buildTransport();
  await transport.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: toEmail,
    subject: 'Reset your Talent Marketplace password',
    text: `We received a request to reset your password. Click the link below to choose a new one:\n\n${resetUrl}\n\nThis link expires in 1 hour. If you did not request this, you can safely ignore this email.`,
    html: `<p>We received a request to reset your password.</p><p><a href="${resetUrl}">Click here to choose a new password</a></p><p>This link expires in 1 hour. If you did not request this, you can safely ignore this email.</p>`,
  });

  return { delivered: true, method: 'smtp' };
};

module.exports = { sendPasswordResetEmail, isSmtpConfigured };
