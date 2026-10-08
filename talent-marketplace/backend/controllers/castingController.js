const CastingCall = require('../models/CastingCall');
const IndustryProfile = require('../models/IndustryProfile');
const PageantOrgProfile = require('../models/PageantOrgProfile');
const Application = require('../models/Application');
const { computeMatchScore } = require('../utils/matchScore');
const { parsePagination } = require('../utils/pagination');
const { priorityRankStage } = require('../utils/regionPriority');

// Fields a creator may edit on their own casting call. Ownership
// (creatorProfileId/creatorType) and lifecycle (status) are deliberately
// excluded — status only ever changes via the dedicated closeCastingCall
// action, and ownership never changes at all.
const UPDATABLE_FIELDS = [
  'title',
  'country',
  'category',
  'criteria',
  'description',
  'applicationDeadline',
  'moodboardUrl',
  'compensation',
];
const pickUpdatableFields = (body) => {
  const payload = {};
  for (const field of UPDATABLE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(body, field)) payload[field] = body[field];
  }
  return payload;
};

// Helper to get creator profile
const getCreatorProfile = async (userId, role) => {
  if (role === 'industry_professional') return IndustryProfile.findOne({ userId });
  if (role === 'pageant_organizer') return PageantOrgProfile.findOne({ userId });
  return null;
};

exports.createCastingCall = async (req, res) => {
  try {
    const creatorProfile = await getCreatorProfile(req.user.id, req.user.role);
    if (!creatorProfile) {
      return res
        .status(403)
        .json({
          success: false,
          errorCode: 'FORBIDDEN',
          message: 'You must complete your profile before creating a casting call.',
        });
    }

    const castingCall = await CastingCall.create({
      ...pickUpdatableFields(req.body),
      creatorProfileId: creatorProfile._id,
      creatorType: req.user.role,
    });

    res.status(201).json({ success: true, data: castingCall });
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      return res
        .status(400)
        .json({ success: false, errorCode: 'VALIDATION_ERROR', message: err.message });
    }
    res.status(500).json({ success: false, errorCode: 'INTERNAL_ERROR', message: 'Server Error' });
  }
};

// Lazily transition any casting call whose deadline has passed from
// 'open' to 'expired'. Cheap enough to run on every list/detail read, and
// avoids needing a separate scheduled job for a prototype-scale app.
const expireOverdueCastingCalls = async () => {
  await CastingCall.updateMany(
    { status: 'open', applicationDeadline: { $lt: new Date() } },
    { $set: { status: 'expired' } },
  );
};

exports.getCastingCalls = async (req, res) => {
  try {
    await expireOverdueCastingCalls();
    const { country, category, status } = req.query;
    const { page, limit, skip } = parsePagination(req.query);

    const query = {};
    // Non-admins always get the public default (open only) unless they ask
    // for a specific status explicitly. Admins get every status when none
    // is specified — this is what the admin Castings tab needs to show
    // open/closed/expired in one real, correctly-paginated list instead of
    // the frontend fetching three separate single-status pages and trying
    // to merge them into one (that approach couldn't produce a coherent
    // page 2, and its "Next" button had no way to know when to disable).
    if (status) {
      query.status = status;
    } else if (req.user?.role !== 'admin') {
      query.status = 'open';
    }
    if (country) query.country = country;
    if (category) query.category = category;
    // Admins can see admin-removed castings in the list (e.g. to restore
    // them); everyone else never sees them at all.
    if (req.user?.role !== 'admin') query.isRemovedByAdmin = { $ne: true };

    const castings = await CastingCall.aggregate([
      { $match: query },
      priorityRankStage,
      { $sort: { _priorityRank: 1, createdAt: -1, _id: 1 } },
      { $skip: skip },
      { $limit: limit },
      { $project: { _priorityRank: 0 } },
    ]);

    const count = await CastingCall.countDocuments(query);

    res.status(200).json({
      success: true,
      data: castings,
      meta: {
        page,
        limit,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, errorCode: 'INTERNAL_ERROR', message: 'Server Error' });
  }
};

exports.getCastingCallById = async (req, res) => {
  try {
    let castingCall = await CastingCall.findById(req.params.id);
    if (!castingCall)
      return res
        .status(404)
        .json({ success: false, errorCode: 'NOT_FOUND', message: 'Casting call not found' });

    // A casting removed by an admin is invisible to everyone else, exactly
    // like it not existing — the admin themselves can still fetch it.
    if (castingCall.isRemovedByAdmin && req.user?.role !== 'admin') {
      return res
        .status(404)
        .json({ success: false, errorCode: 'NOT_FOUND', message: 'Casting call not found' });
    }

    if (castingCall.status === 'open' && castingCall.applicationDeadline < new Date()) {
      castingCall.status = 'expired';
      await castingCall.save();
    }

    res.status(200).json({ success: true, data: castingCall });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, errorCode: 'INTERNAL_ERROR', message: 'Server Error' });
  }
};

exports.updateCastingCall = async (req, res) => {
  try {
    const castingCall = await CastingCall.findById(req.params.id);
    if (!castingCall)
      return res
        .status(404)
        .json({ success: false, errorCode: 'NOT_FOUND', message: 'Casting call not found' });

    const creatorProfile = await getCreatorProfile(req.user.id, req.user.role);
    if (
      !creatorProfile ||
      castingCall.creatorProfileId.toString() !== creatorProfile._id.toString()
    ) {
      return res
        .status(403)
        .json({
          success: false,
          errorCode: 'FORBIDDEN',
          message: 'Not authorized to edit this casting call',
        });
    }

    if (castingCall.status === 'closed') {
      return res
        .status(409)
        .json({
          success: false,
          errorCode: 'INVALID_STATE_TRANSITION',
          message: 'Cannot edit a closed casting call',
        });
    }

    const updated = await CastingCall.findByIdAndUpdate(
      req.params.id,
      pickUpdatableFields(req.body),
      { returnDocument: 'after', runValidators: true },
    );
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, errorCode: 'INTERNAL_ERROR', message: 'Server Error' });
  }
};

exports.closeCastingCall = async (req, res) => {
  try {
    const castingCall = await CastingCall.findById(req.params.id);
    if (!castingCall)
      return res
        .status(404)
        .json({ success: false, errorCode: 'NOT_FOUND', message: 'Casting call not found' });

    const creatorProfile = await getCreatorProfile(req.user.id, req.user.role);
    if (
      !creatorProfile ||
      castingCall.creatorProfileId.toString() !== creatorProfile._id.toString()
    ) {
      return res
        .status(403)
        .json({ success: false, errorCode: 'FORBIDDEN', message: 'Not authorized' });
    }

    castingCall.status = 'closed';
    await castingCall.save();
    res.status(200).json({ success: true, data: castingCall });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, errorCode: 'INTERNAL_ERROR', message: 'Server Error' });
  }
};

exports.getApplicants = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;
    const { page, limit, skip } = parsePagination(req.query);

    const castingCall = await CastingCall.findById(id);
    if (!castingCall)
      return res
        .status(404)
        .json({ success: false, errorCode: 'NOT_FOUND', message: 'Casting call not found' });

    const creatorProfile = await getCreatorProfile(req.user.id, req.user.role);
    if (
      !creatorProfile ||
      castingCall.creatorProfileId.toString() !== creatorProfile._id.toString()
    ) {
      return res
        .status(403)
        .json({ success: false, errorCode: 'FORBIDDEN', message: 'Not authorized' });
    }

    const query = { castingCallId: id };
    if (status) query.status = status;

    const applications = await Application.find(query)
      // dateOfBirth and skills weren't previously selected here — they're
      // needed inputs to computeMatchScore below, in addition to the fields
      // this endpoint already returned for display.
      .populate(
        'modelProfileId',
        'fullName country heightCm category measurements dateOfBirth skills',
      )
      .sort({ appliedAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec();

    const count = await Application.countDocuments(query);

    // Enrich each applicant with how well they fit THIS casting call's own
    // criteria — same rule-based scorer used by the standalone
    // recommendations endpoint, just applied per-applicant instead of
    // across all published profiles. Existing pagination/authorization
    // above is untouched.
    const applicationsWithScore = applications.map((application) => {
      const plain = application.toObject();
      if (plain.modelProfileId) {
        const { score, breakdown, explanation, matchTier, keyStrengths, keyGaps } =
          computeMatchScore(castingCall, plain.modelProfileId);
        plain.matchScore = score;
        plain.matchBreakdown = breakdown;
        plain.matchExplanation = explanation;
        plain.matchTier = matchTier;
        plain.matchStrengths = keyStrengths || [];
        plain.matchGaps = keyGaps || [];
      } else {
        // modelProfileId can be null if the model deleted their profile
        // after applying — nothing to score against.
        plain.matchScore = null;
        plain.matchBreakdown = null;
        plain.matchExplanation = null;
        plain.matchTier = null;
        plain.matchStrengths = [];
        plain.matchGaps = [];
      }
      return plain;
    });

    res.status(200).json({
      success: true,
      data: applicationsWithScore,
      meta: {
        page: Number(page),
        limit: Number(limit),
        totalItems: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, errorCode: 'INTERNAL_ERROR', message: 'Server Error' });
  }
};
