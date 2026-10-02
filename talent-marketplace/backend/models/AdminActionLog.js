const mongoose = require('mongoose');

const adminActionLogSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Free-form but conventionally namespaced, e.g. 'user.suspend',
    // 'casting.remove', 'report.resolve', 'profile.verify'.
    action: { type: String, required: true },
    targetType: { type: String },
    targetId: { type: mongoose.Schema.Types.ObjectId },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true },
);

adminActionLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AdminActionLog', adminActionLogSchema);
