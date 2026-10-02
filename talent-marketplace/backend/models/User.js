const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      // Without this, "User@Example.com" and "user@example.com" register as
      // two different accounts (the unique index is case-sensitive), and a
      // user who typed their email differently at login than at registration
      // gets "Invalid credentials" instead of matching their own account.
      lowercase: true,
      trim: true,
      match: [
        // Linear-time email pattern (no nested quantifiers) to avoid ReDoS
        /^[\w.-]+@[\w-]+(\.[\w-]+)+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [8, 'Password must be at least 8 characters'],
      validate: {
        // Runs before the pre('save') hashing hook below, so this still sees
        // the plaintext candidate. Matches the complexity rule the project's
        // own Security_Data_Protection_Policy.md documents (min 8 chars,
        // at least one letter and one number) — previously unenforced.
        validator: function (value) {
          if (!this.isModified('password')) return true; // don't re-validate an already-hashed value on unrelated updates
          return /[A-Za-z]/.test(value) && /\d/.test(value);
        },
        message: 'Password must contain at least one letter and one number',
      },
      select: false, // Do not return password by default
    },
    // Canonical role vocabulary — this MUST match every authorize()/role check
    // across routes, controllers, sockets, and the frontend. 'admin' can never
    // be set via public registration (see authController.register).
    role: {
      type: String,
      enum: ['model', 'industry_professional', 'pageant_organizer', 'admin'],
      default: 'model',
    },
    status: {
      type: String,
      enum: ['Active', 'Suspended', 'Pending'],
      default: 'Active',
    },
    // Password-reset flow: only ever store a SHA-256 hash of the reset token
    // (same convention as RefreshToken.js's `token` field) — the plaintext
    // token lives only in the emailed URL, never in the database. Both are
    // `select: false` so a normal `User.findOne()`/`findById()` never returns
    // them; the reset-password handler explicitly `.select('+resetPasswordTokenHash +resetPasswordExpires')`s.
    resetPasswordTokenHash: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

// Encrypt password using bcrypt
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
