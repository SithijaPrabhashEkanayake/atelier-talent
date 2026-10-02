const Message = require('../models/Message');
const Application = require('../models/Application');
const IndustryProfile = require('../models/IndustryProfile');
const PageantOrgProfile = require('../models/PageantOrgProfile');
const ModelProfile = require('../models/ModelProfile');

exports.getMessages = async (req, res) => {
  try {
    const { applicationId } = req.params;

    // Verify application exists and is accepted
    const application = await Application.findById(applicationId).populate('castingCallId');
    if (!application || application.status !== 'accepted') {
      return res
        .status(403)
        .json({
          success: false,
          errorCode: 'FORBIDDEN',
          message: 'Chat is only available for accepted applications.',
        });
    }

    // Verify authorization
    let isAuthorized = false;
    if (req.user.role === 'model') {
      const modelProfile = await ModelProfile.findOne({ userId: req.user.id });
      if (modelProfile && application.modelProfileId.toString() === modelProfile._id.toString())
        isAuthorized = true;
    } else {
      let creatorProfile;
      if (req.user.role === 'industry_professional')
        creatorProfile = await IndustryProfile.findOne({ userId: req.user.id });
      if (req.user.role === 'pageant_organizer')
        creatorProfile = await PageantOrgProfile.findOne({ userId: req.user.id });
      if (
        creatorProfile &&
        application.castingCallId.creatorProfileId.toString() === creatorProfile._id.toString()
      )
        isAuthorized = true;
    }

    if (!isAuthorized) {
      return res
        .status(403)
        .json({
          success: false,
          errorCode: 'FORBIDDEN',
          message: 'Not authorized to view these messages.',
        });
    }

    const messages = await Message.find({ applicationId })
      .sort({ createdAt: 1 })
      .populate('senderId', 'email role');

    // Mark messages as read
    await Message.updateMany(
      { applicationId, senderId: { $ne: req.user.id }, read: false },
      { $set: { read: true } },
    );

    res.status(200).json({ success: true, data: messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, errorCode: 'INTERNAL_ERROR', message: 'Server Error' });
  }
};
