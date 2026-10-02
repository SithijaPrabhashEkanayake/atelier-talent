const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    castingCallId: { type: mongoose.Schema.Types.ObjectId, ref: 'CastingCall', required: true },
    modelProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'ModelProfile', required: true },
    status: {
      type: String,
      enum: ['submitted', 'shortlisted', 'rejected', 'accepted'],
      default: 'submitted',
    },
    statusUpdatedAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: 'appliedAt', updatedAt: true } },
);

// Prevent duplicate applications
applicationSchema.index({ castingCallId: 1, modelProfileId: 1 }, { unique: true });
applicationSchema.index({ modelProfileId: 1, status: 1 });
applicationSchema.index({ castingCallId: 1, status: 1 });

// Automatically update statusUpdatedAt.
// Synchronous style (no `next` callback) — see the identical fix and note
// in CastingCall.js; the old `function(next)` form crashed every single
// application create/update with "next is not a function".
applicationSchema.pre('save', function () {
  if (this.isModified('status')) {
    this.statusUpdatedAt = Date.now();
  }
});

module.exports = mongoose.model('Application', applicationSchema);
