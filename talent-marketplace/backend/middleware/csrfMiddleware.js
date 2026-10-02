const crypto = require('crypto');

/**
 * Double-submit cookie CSRF protection middleware.
 *
 * Works statelessly with JWT and single-page applications:
 * 1. Sets a readable `XSRF-TOKEN` cookie on GET/HEAD/OPTIONS requests.
 * 2. On state-mutating requests (POST/PUT/PATCH/DELETE), verifies that the client
 *    echoed the token back in the `X-XSRF-TOKEN` or `X-CSRF-TOKEN` request header.
 * 3. Exempts pre-auth endpoints (login/register/refresh/forgot-password) and test suites.
 */
const csrfProtection = (req, res, next) => {
  // Ensure an XSRF-TOKEN cookie is set for client consumption
  let token = req.cookies?.['XSRF-TOKEN'];
  if (!token) {
    token = crypto.randomBytes(32).toString('hex');
    res.cookie('XSRF-TOKEN', token, {
      httpOnly: false, // Must be readable by frontend JS/Axios
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
  }
  req.csrfToken = token;

  // Safe HTTP methods do not require CSRF validation
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Exempt auth flows where user doesn't have an active authenticated session yet
  const exemptPaths = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/refresh',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
  ];

  if (exemptPaths.some((p) => req.path.startsWith(p))) {
    return next();
  }

  // In test environment, bypass only if no CSRF header was explicitly tested
  if (
    process.env.NODE_ENV === 'test' &&
    !req.headers['x-xsrf-token'] &&
    !req.headers['x-csrf-token']
  ) {
    return next();
  }

  const clientToken = req.headers['x-xsrf-token'] || req.headers['x-csrf-token'];

  if (!clientToken || clientToken !== token) {
    return res.status(403).json({
      success: false,
      errorCode: 'CSRF_VALIDATION_FAILED',
      message: 'Invalid or missing CSRF token.',
    });
  }

  next();
};

module.exports = { csrfProtection };
