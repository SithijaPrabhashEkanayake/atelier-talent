const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

messageSchema.index({ applicationId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
