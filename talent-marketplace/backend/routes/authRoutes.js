const express = require('express');
const {
  register,
  login,
  refresh,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { createRateLimiter } = require('../middleware/security');

const router = express.Router();

// forgot-password is a spam/cost vector in its own right (each request can
// trigger an outbound email) — give it a tighter, dedicated budget instead
// of sharing the general /api/auth limiter with login/register/refresh.
const forgotPasswordLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many password reset requests. Please try again in an hour.',
});

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
