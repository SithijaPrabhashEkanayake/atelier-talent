const crypto = require('crypto');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { generateAccessToken, generateRefreshTokenString } = require('../utils/generateTokens');
const { sendPasswordResetEmail } = require('../utils/email');

// Same hashing convention as RefreshToken.js — never store the plaintext
// reset token, only its SHA-256 hash. The plaintext only ever lives in the
// URL that gets emailed to the user.
const hashResetToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

// Generic, identical response for forgot-password regardless of whether the
// account exists — never let a client distinguish "email sent" from
// "account not found" (classic account-enumeration vector).
const GENERIC_FORGOT_PASSWORD_MESSAGE =
  'If an account with that email exists, a password reset link has been sent.';

// Roles a caller may self-assign at public registration. 'admin' is
// deliberately excluded — admin accounts must be provisioned another way
// (directly in the DB, or a future invite-only admin flow), never via a
// client-supplied field on a public endpoint.
const PUBLIC_REGISTRATION_ROLES = ['model', 'industry_professional', 'pageant_organizer'];

// Shared by every place that sets OR clears the refresh cookie — logout
// previously cleared it with different (default) secure/sameSite
// attributes than login/register/refresh set it with, which some browsers
// treat as a non-matching cookie and may not actually expire.
const refreshCookieOptions = (expires) => ({
  expires,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
});

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Helper to set cookie
const sendTokenResponse = async (user, statusCode, res) => {
  // Create token
  const token = generateAccessToken(user._id);
  const refreshTokenString = generateRefreshTokenString();

  // Save refresh token to db
  const expires = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
  await RefreshToken.create({
    user: user._id,
    token: refreshTokenString,
    expires,
  });

  const options = refreshCookieOptions(expires);

  res
    .status(statusCode)
    .cookie('refreshToken', refreshTokenString, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { password, role } = req.body;
    // The schema's `lowercase: true` only normalizes on save, not on query
    // filters — without lowercasing here too, "User@x.com" and "user@x.com"
    // would pass this existence check as two different accounts.
    const email =
      typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : req.body.email;

    // Never trust a client-supplied role beyond the public allow-list —
    // 'admin' (or anything else) must not be self-assignable here.
    const safeRole = PUBLIC_REGISTRATION_ROLES.includes(role) ? role : 'model';

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      role: safeRole,
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    // A duplicate email can still reach here even after the findOne check
    // above (two concurrent registrations racing the same email — a real,
    // reachable TOCTOU, not just theoretical), and a failed password/email
    // validator throws a Mongoose ValidationError. Both were previously
    // falling through to the global error handler, which echoes
    // `err.message` verbatim — for a Mongo duplicate-key error that's the
    // raw driver message, including the database name, collection name,
    // and index name. Handle both explicitly with clean, generic messages.
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(err.errors)
          .map((e) => e.message)
          .join(' '),
      });
    }
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { password } = req.body;
    const rawEmail = req.body.email;

    // Validate email & password
    if (!rawEmail || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'Please provide an email and password' });
    }
    const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : rawEmail;

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.status !== 'Active') {
      return res
        .status(403)
        .json({
          success: false,
          message: `Account is ${user.status.toLowerCase()}. Contact support for help.`,
        });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
exports.refresh = async (req, res, next) => {
  try {
    const refreshTokenString = req.cookies.refreshToken;

    if (!refreshTokenString) {
      return res.status(401).json({ success: false, message: 'No refresh token provided' });
    }

    // Find all tokens for optimization we could query directly but token is hashed in db
    // So we need to fetch all and match or hash here and query.
    // Better to hash here and query.
    const crypto = require('crypto');
    const hashedToken = crypto.createHash('sha256').update(refreshTokenString).digest('hex');

    const refreshToken = await RefreshToken.findOne({ token: hashedToken }).populate('user');

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    if (refreshToken.isExpired || refreshToken.revoked) {
      return res.status(401).json({ success: false, message: 'Refresh token expired or revoked' });
    }

    // Create new tokens
    const accessToken = generateAccessToken(refreshToken.user._id);
    const newRefreshTokenString = generateRefreshTokenString();

    const expires = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

    // Revoke old token and create new
    refreshToken.revoked = new Date();
    refreshToken.replacedByToken = crypto
      .createHash('sha256')
      .update(newRefreshTokenString)
      .digest('hex');
    await refreshToken.save();

    await RefreshToken.create({
      user: refreshToken.user._id,
      token: newRefreshTokenString,
      expires,
    });

    const options = refreshCookieOptions(expires);

    res.status(200).cookie('refreshToken', newRefreshTokenString, options).json({
      success: true,
      token: accessToken,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    const refreshTokenString = req.cookies.refreshToken;

    if (refreshTokenString) {
      const crypto = require('crypto');
      const hashedToken = crypto.createHash('sha256').update(refreshTokenString).digest('hex');
      await RefreshToken.findOneAndUpdate({ token: hashedToken }, { revoked: new Date() });
    }

    // Same options object shape used to set the cookie — a clear with
    // different secure/sameSite attributes can be treated as a different
    // cookie by the browser and fail to actually expire the real one.
    res.cookie('refreshToken', 'none', refreshCookieOptions(new Date(Date.now() + 10 * 1000)));

    res.status(200).json({
      success: true,
      message: 'User logged out',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    // Same normalized shape as sendTokenResponse (`id`, not `_id`) — the
    // two must match, or every place in the frontend that reads
    // `user.id`/`user._id` depending on which auth path just ran silently
    // breaks after a page reload.
    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Request a password reset link
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const rawEmail = req.body.email;

    if (!rawEmail) {
      return res.status(400).json({ success: false, message: 'Please provide an email' });
    }
    const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : rawEmail;

    const user = await User.findOne({ email });

    // Always respond with the same generic message whether or not the
    // account exists — the branch below only changes what happens
    // server-side (generating+emailing a token), never the response.
    if (user) {
      const resetTokenPlaintext = crypto.randomBytes(32).toString('hex');

      user.resetPasswordTokenHash = hashResetToken(resetTokenPlaintext);
      user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
      // Only the reset-token fields changed — skip re-running password/email
      // validation on unrelated, already-valid fields.
      await user.save({ validateModifiedOnly: true });

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const resetUrl = `${frontendUrl}/reset-password/${resetTokenPlaintext}`;

      try {
        await sendPasswordResetEmail(user.email, resetUrl);
      } catch (emailErr) {
        // Don't let an email-provider failure leak into the response (that
        // would also re-introduce the enumeration issue this endpoint is
        // designed to avoid) — log server-side and still return the generic
        // success message.
        console.error('Failed to send password reset email:', emailErr);
      }
    }

    res.status(200).json({ success: true, message: GENERIC_FORGOT_PASSWORD_MESSAGE });
  } catch (err) {
    next(err);
  }
};

// @desc    Reset password using a token emailed via forgot-password
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: 'Please provide a new password' });
    }

    const tokenHash = hashResetToken(token);

    const user = await User.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+resetPasswordTokenHash +resetPasswordExpires');

    // Same generic message whether the token is unknown, already used, or
    // expired — don't give an attacker a way to distinguish those cases.
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid or expired password reset token' });
    }

    // Let the existing User schema validator (min 8 chars, letter+number)
    // and the pre('save') bcrypt hook do their normal job.
    user.password = password;
    user.resetPasswordTokenHash = undefined;
    user.resetPasswordExpires = undefined;

    try {
      await user.save();
    } catch (err) {
      if (err.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: Object.values(err.errors)
            .map((e) => e.message)
            .join(' '),
        });
      }
      throw err;
    }

    // A password reset is a strong signal the old session(s) may be
    // compromised — revoke every existing refresh token for this user so a
    // stolen refresh cookie doesn't survive the reset.
    await RefreshToken.updateMany(
      { user: user._id, revoked: { $exists: false } },
      { revoked: new Date() },
    );

    res.status(200).json({ success: true, message: 'Password has been reset successfully' });
  } catch (err) {
    next(err);
  }
};
