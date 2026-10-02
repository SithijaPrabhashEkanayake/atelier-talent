const mongoose = require('mongoose');

const castingCallSchema = new mongoose.Schema(
  {
    creatorProfileId: { type: mongoose.Schema.Types.ObjectId, required: true },
    creatorType: {
      type: String,
      enum: ['industry_professional', 'pageant_organizer'],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    country: { type: String, required: true },
    category: { type: String, required: true },
    criteria: {
      minAge: { type: Number },
      maxAge: { type: Number },
      minHeightCm: { type: Number },
      maxHeightCm: { type: Number },
      experienceLevel: { type: String, default: 'any' },
      requiredSkills: [{ type: String }],
    },
    description: { type: String, required: true },
    applicationDeadline: { type: Date, required: true },
    status: { type: String, enum: ['open', 'closed', 'expired'], default: 'open' },
    // Admin moderation flag — deliberately separate from `status`, which
    // tracks the casting's own lifecycle (open/closed/expired) and has
    // different meaning. A removed casting keeps its underlying status but
    // is hidden from non-admins in list/detail views.
    isRemovedByAdmin: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Custom validation for age and height logic.
// Synchronous style (no `next` callback) — this Mongoose version doesn't
// invoke a `next` argument for `pre('validate')` hooks, so the old
// `function(next) { ...; next(); }` form left `next` undefined and threw
// "next is not a function" on every single create/update, a 500 error a
// real user would hit on every "Post a Casting Call" submission.
castingCallSchema.pre('validate', function () {
  if (this.criteria.minAge && this.criteria.maxAge && this.criteria.minAge > this.criteria.maxAge) {
    this.invalidate('criteria.minAge', 'Minimum age cannot be greater than maximum age.');
  }
  if (
    this.criteria.minHeightCm &&
    this.criteria.maxHeightCm &&
    this.criteria.minHeightCm > this.criteria.maxHeightCm
  ) {
    this.invalidate(
      'criteria.minHeightCm',
      'Minimum height cannot be greater than maximum height.',
    );
  }
});

castingCallSchema.index({ country: 1, category: 1, status: 1 });
castingCallSchema.index({ applicationDeadline: 1 });
castingCallSchema.index({ creatorProfileId: 1 });

module.exports = mongoose.model('CastingCall', castingCallSchema);
