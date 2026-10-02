const mongoose = require('mongoose');
const crypto = require('crypto');

const refreshTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  expires: {
    type: Date,
    required: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
  createdByIp: String,
  revoked: Date,
  revokedByIp: String,
  replacedByToken: String,
});

// Virtual property to check if token is active
refreshTokenSchema.virtual('isExpired').get(function () {
  return Date.now() >= this.expires;
});

refreshTokenSchema.virtual('isActive').get(function () {
  return !this.revoked && !this.isExpired;
});

// Hash the token before saving to database for security
refreshTokenSchema.pre('save', function () {
  if (this.isModified('token')) {
    this.token = crypto.createHash('sha256').update(this.token).digest('hex');
  }
});

// Method to verify hashed token
refreshTokenSchema.methods.matchToken = function (enteredToken) {
  const hashedToken = crypto.createHash('sha256').update(enteredToken).digest('hex');
  return this.token === hashedToken;
};

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
