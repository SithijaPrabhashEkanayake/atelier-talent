const ModelProfile = require('../models/ModelProfile');
const CastingCall = require('../models/CastingCall');
const Application = require('../models/Application');

// Public, aggregate-only counts for the homepage. Every figure is read from
// the database so nothing shown on the landing page is a hardcoded claim.
exports.getPlatformStats = async (req, res) => {
  try {
    const [publishedTalent, verifiedTalent, openCastings, submissions] = await Promise.all([
      ModelProfile.countDocuments({ isPublished: true }),
      ModelProfile.countDocuments({ isPublished: true, isVerified: true }),
      CastingCall.countDocuments({ status: 'open', isRemovedByAdmin: { $ne: true } }),
      Application.countDocuments({}),
    ]);

    res.status(200).json({
      success: true,
      data: { publishedTalent, verifiedTalent, openCastings, submissions },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, errorCode: 'INTERNAL_ERROR', message: 'Server Error' });
  }
};
