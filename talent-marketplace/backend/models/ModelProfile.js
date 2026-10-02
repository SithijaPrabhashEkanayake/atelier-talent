const mongoose = require('mongoose');

const modelProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    fullName: { type: String, required: true, trim: true },
    country: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    heightCm: { type: Number, required: true, min: 0 },
    measurements: {
      bust: Number,
      waist: Number,
      hips: Number,
    },
    category: { type: String, required: true },
    representationStatus: {
      type: String,
      enum: ['freelance', 'agency_represented'],
      required: true,
    },
    agencyName: { type: String, default: null },
    experience: [
      {
        title: String,
        organization: String,
        year: Number,
        description: String,
      },
    ],
    skills: [{ type: String }],
    socialLinks: {
      instagram: String,
      tiktok: String,
    },
    isPublished: { type: Boolean, default: false },
    // Admin-only — never settable through the self-service profile update
    // endpoint (see profileController.updateMyProfile).
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

modelProfileSchema.index({ country: 1, category: 1 });
modelProfileSchema.index({ heightCm: 1 });
modelProfileSchema.index({ dateOfBirth: 1 });

module.exports = mongoose.model('ModelProfile', modelProfileSchema);
