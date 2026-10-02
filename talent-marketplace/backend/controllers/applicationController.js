const Application = require('../models/Application');
const CastingCall = require('../models/CastingCall');
const ModelProfile = require('../models/ModelProfile');
const IndustryProfile = require('../models/IndustryProfile');
const PageantOrgProfile = require('../models/PageantOrgProfile');

exports.applyToCasting = async (req, res) => {
  try {
    const { castingCallId } = req.body;

    // Verify model profile exists
    const modelProfile = await ModelProfile.findOne({ userId: req.user.id });
    if (!modelProfile) {
      return res
        .status(403)
        .json({
          success: false,
          errorCode: 'FORBIDDEN',
          message: 'Please complete your profile before applying.',
        });
    }

    // Verify casting call is open
    const castingCall = await CastingCall.findById(castingCallId);
    if (!castingCall || castingCall.status !== 'open') {
      return res
        .status(409)
        .json({
          success: false,
          errorCode: 'INVALID_STATE_TRANSITION',
          message: 'Casting call is not open for applications.',
        });
    }

    const application = await Application.create({
      castingCallId,
      modelProfileId: modelProfile._id,
    });

    // Notify the casting owner in real-time
    try {
      const notificationService = require('../services/notificationService');
      let creatorUserId = null;
      if (castingCall.creatorType === 'industry_professional') {
        const creatorProfile = await IndustryProfile.findById(castingCall.creatorProfileId);
        creatorUserId = creatorProfile?.userId;
      } else if (castingCall.creatorType === 'pageant_organizer') {
        const creatorProfile = await PageantOrgProfile.findById(castingCall.creatorProfileId);
        creatorUserId = creatorProfile?.userId;
      }

      if (creatorUserId) {
        await notificationService.createNotification({
          userId: creatorUserId,
          type: 'application_update',
          message: `New applicant (${modelProfile.fullName || 'Model'}) applied to "${castingCall.title}"`,
          link: `/castings/${castingCall._id}/applicants`,
          metadata: { castingCallId: castingCall._id, applicationId: application._id },
        });
      }
    } catch (notifErr) {
      console.error('Non-blocking application submission notification error:', notifErr);
    }

    res.status(201).json({ success: true, data: application });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res
        .status(409)
        .json({
          success: false,
          errorCode: 'DUPLICATE_RESOURCE',
          message: 'You have already applied to this casting call.',
        });
    }
    res.status(500).json({ success: false, errorCode: 'INTERNAL_ERROR', message: 'Server Error' });
  }
};

exports.getMyApplications = async (req, res) => {
  try {
    const modelProfile = await ModelProfile.findOne({ userId: req.user.id });
    if (!modelProfile) {
      return res
        .status(404)
        .json({ success: false, errorCode: 'NOT_FOUND', message: 'Model profile not found.' });
    }

    const applications = await Application.find({ modelProfileId: modelProfile._id })
      .populate('castingCallId', 'title country category status applicationDeadline')
      .sort({ appliedAt: -1 })
      .exec();

    res.status(200).json({ success: true, data: applications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, errorCode: 'INTERNAL_ERROR', message: 'Server Error' });
  }
};

const APPLICATION_STATUSES = ['submitted', 'shortlisted', 'rejected', 'accepted'];

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!APPLICATION_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        errorCode: 'VALIDATION_ERROR',
        message: `status must be one of: ${APPLICATION_STATUSES.join(', ')}`,
      });
    }

    const application = await Application.findById(id).populate('castingCallId');
    if (!application) {
      return res
        .status(404)
        .json({ success: false, errorCode: 'NOT_FOUND', message: 'Application not found' });
    }

    // Verify recruiter owns the casting call
    const role = req.user.role;
    let creatorProfile;
    if (role === 'industry_professional')
      creatorProfile = await IndustryProfile.findOne({ userId: req.user.id });
    if (role === 'pageant_organizer')
      creatorProfile = await PageantOrgProfile.findOne({ userId: req.user.id });

    if (
      !creatorProfile ||
      application.castingCallId.creatorProfileId.toString() !== creatorProfile._id.toString()
    ) {
      return res
        .status(403)
        .json({ success: false, errorCode: 'FORBIDDEN', message: 'Not authorized' });
    }

    application.status = status;
    await application.save();

    // Trigger real-time notification
    const notificationService = require('../services/notificationService');
    const ModelProfile = require('../models/ModelProfile');

    // Find the user ID of the model
    const modelProfile = await ModelProfile.findById(application.modelProfileId);
    if (modelProfile) {
      await notificationService.createNotification({
        userId: modelProfile.userId,
        type: 'application_update',
        message: `Your application for "${application.castingCallId.title}" has been updated to: ${status}`,
        link: `/my-applications`,
        metadata: {
          applicationId: application._id,
          status,
          castingCallId: application.castingCallId._id,
        },
      });
    }

    res.status(200).json({ success: true, data: application });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, errorCode: 'INTERNAL_ERROR', message: 'Server Error' });
  }
};
