const { getJwtSecret } = require('../utils/jwtSecret');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  try {
    // Verify token — pin the algorithm explicitly so a token signed (or
    // forged) with a different/downgraded algorithm is never accepted.
    const decoded = jwt.verify(
      token,
      getJwtSecret(),
      { algorithms: ['HS256'] },
    );

    const user = await User.findById(decoded.id);

    // The token can still be valid after the account was deleted or
    // suspended — reject explicitly instead of letting `req.user` be
    // null/stale and crashing (or silently succeeding) downstream.
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: 'Not authorized to access this route' });
    }
    if (user.status !== 'Active') {
      return res
        .status(403)
        .json({ success: false, message: `Account is ${user.status.toLowerCase()}.` });
    }

    req.user = user;
    next();
  } catch (err) {
    // Expired/malformed/forged tokens land here — not logged as an error,
    // this is an expected, routine outcome of normal token expiry.
    return res
      .status(401)
      .json({ success: false, message: 'Not authorized to access this route', reason: err.name });
  }
};
// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user?.role} is not authorized to access this route`,
      });
    }
    next();
  };
};

const optionalProtect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret(), { algorithms: ['HS256'] });
    const user = await User.findById(decoded.id);
    if (user && user.status === 'Active') {
      req.user = user;
    }
    next();
  } catch (_err) {
    next();
  }
};

module.exports = { protect, authorize, optionalProtect };

