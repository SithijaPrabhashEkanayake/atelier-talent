const jwt = require('jsonwebtoken');

// Generate short-lived Access Token
const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Generate long-lived Refresh Token string (not JWT)
const generateRefreshTokenString = () => {
  const crypto = require('crypto');
  return crypto.randomBytes(40).toString('hex');
};

module.exports = { generateAccessToken, generateRefreshTokenString };
