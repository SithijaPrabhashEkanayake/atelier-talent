const mongoose = require('mongoose');

const industryProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    organizationName: { type: String, required: true, trim: true },
    organizationType: {
      type: String,
      enum: ['brand', 'director', 'agency', 'photographer'],
      required: true,
    },
    country: { type: String, required: true },
    description: { type: String, default: '' },
    website: { type: String, default: null },
    isPublished: { type: Boolean, default: false },
    // Admin-only — never settable through the self-service profile update
    // endpoint (see profileController.updateMyProfile).
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

industryProfileSchema.index({ country: 1, organizationType: 1 });

module.exports = mongoose.model('IndustryProfile', industryProfileSchema);
