const mongoose = require('mongoose');

const portfolioItemSchema = new mongoose.Schema(
  {
    modelProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'ModelProfile', required: true },
    type: { type: String, enum: ['photo', 'video'], required: true },
    category: { type: String, required: true },
    mediaUrl: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
    // Cloudinary public_id, needed to delete the asset later. Null for
    // items whose mediaUrl isn't a Cloudinary upload (e.g. seeded demo
    // data using external placeholder images) — deletion just skips the
    // Cloudinary call for those.
    publicId: { type: String, default: null },
    fileSizeBytes: { type: Number, required: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: 'uploadedAt', updatedAt: true } },
);

portfolioItemSchema.index({ modelProfileId: 1, sortOrder: 1 });

module.exports = mongoose.model('PortfolioItem', portfolioItemSchema);
