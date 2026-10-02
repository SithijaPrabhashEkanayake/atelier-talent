const jwt = require('jsonwebtoken');

// Generate short-lived Access Token (defaults to 15m if JWT_EXPIRE not explicitly set)
const generateAccessToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'super_secret_jwt_key_change_me_in_production',
    {
      expiresIn: process.env.JWT_EXPIRE || '15m',
    },
  );
};

// Generate long-lived Refresh Token string (not JWT)
const generateRefreshTokenString = () => {
  const crypto = require('crypto');
  return crypto.randomBytes(40).toString('hex');
};

module.exports = { generateAccessToken, generateRefreshTokenString };
