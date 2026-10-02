const mongoose = require('mongoose');

const pageantOrgProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    organizationName: { type: String, required: true, trim: true },
    country: { type: String, required: true },
    pageantHistory: [
      {
        pageantName: String,
        year: Number,
        description: String,
      },
    ],
    officialStatus: { type: String, default: '' },
    isPublished: { type: Boolean, default: false },
    // Admin-only — never settable through the self-service profile update
    // endpoint (see profileController.updateMyProfile).
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

pageantOrgProfileSchema.index({ country: 1 });

module.exports = mongoose.model('PageantOrgProfile', pageantOrgProfileSchema);
