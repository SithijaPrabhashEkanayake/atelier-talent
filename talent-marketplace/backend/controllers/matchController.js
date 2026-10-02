const CastingCall = require('../models/CastingCall');
const ModelProfile = require('../models/ModelProfile');
const IndustryProfile = require('../models/IndustryProfile');
const PageantOrgProfile = require('../models/PageantOrgProfile');
const { computeMatchScore } = require('../utils/matchScore');

// Cap on how many ranked results a single request can return — this is
// synchronous, in-request scoring (no job queue), so an unbounded result set
// would mean scoring/sorting an unbounded number of documents per request.
const MAX_RESULTS = 50;

// Cap on how many candidate documents get pulled into memory and scored per
// request. Without this, getRecommendationsForCasting/Model would load every
// published model (or every open casting call) in the whole database on
// every single call — fine at prototype scale, but an unbounded query
// against a large production collection. Most-recent-first keeps the
// sampled pool reasonably fresh if a deployment ever exceeds this cap.
const MAX_CANDIDATES = 500;

// Mirrors the identical helper in castingController.js — kept local (rather
// than exported/shared) since it's a two-line lookup and this module already
// depends on both profile models directly.
const getCreatorProfile = async (userId, role) => {
  if (role === 'industry_professional') return IndustryProfile.findOne({ userId });
  if (role === 'pageant_organizer') return PageantOrgProfile.findOne({ userId });
  return null;
};

// GET /api/castings/:id/recommendations
// For a casting call's owner: score every published ModelProfile against
// this casting's criteria and return the top matches, highest score first.
exports.getRecommendationsForCasting = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 20 } = req.query;

    const castingCall = await CastingCall.findById(id);
    if (!castingCall) {
      return res
        .status(404)
        .json({ success: false, errorCode: 'NOT_FOUND', message: 'Casting call not found' });
    }

    // Same ownership check as castingController.getApplicants — a casting
    // call's recommendations are as sensitive as its applicant list, and
    // must never be visible to a different organizer/agency.
    const creatorProfile = await getCreatorProfile(req.user.id, req.user.role);
    if (
      !creatorProfile ||
      castingCall.creatorProfileId.toString() !== creatorProfile._id.toString()
    ) {
      return res
        .status(403)
        .json({ success: false, errorCode: 'FORBIDDEN', message: 'Not authorized' });
    }

    const cappedLimit = Math.min(Number(limit) || 20, MAX_RESULTS);

    const candidates = await ModelProfile.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .limit(MAX_CANDIDATES)
      .exec();

    const ranked = candidates
      .map((profile) => {
        const { score, breakdown, explanation, matchTier, keyStrengths, keyGaps } =
          computeMatchScore(castingCall, profile);
        return {
          modelProfile: profile,
          score,
          breakdown,
          explanation,
          matchTier,
          keyStrengths,
          keyGaps,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, cappedLimit);

    res.status(200).json({
      success: true,
      data: ranked,
      meta: { totalCandidates: candidates.length, returned: ranked.length, limit: cappedLimit },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, errorCode: 'INTERNAL_ERROR', message: 'Server Error' });
  }
};

// GET /api/match/recommendations/castings
// For a logged-in model: score every currently-open CastingCall against
// their own profile and return the top matches, highest score first.
exports.getRecommendationsForModel = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const modelProfile = await ModelProfile.findOne({ userId: req.user.id });
    if (!modelProfile) {
      return res
        .status(404)
        .json({
          success: false,
          errorCode: 'NOT_FOUND',
          message: 'Please complete your profile before viewing recommendations.',
        });
    }

    const cappedLimit = Math.min(Number(limit) || 20, MAX_RESULTS);

    const openCastings = await CastingCall.find({ status: 'open' })
      .sort({ createdAt: -1 })
      .limit(MAX_CANDIDATES)
      .exec();

    const ranked = openCastings
      .map((castingCall) => {
        const { score, breakdown, explanation, matchTier, keyStrengths, keyGaps } =
          computeMatchScore(castingCall, modelProfile);
        return { castingCall, score, breakdown, explanation, matchTier, keyStrengths, keyGaps };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, cappedLimit);

    res.status(200).json({
      success: true,
      data: ranked,
      meta: { totalCandidates: openCastings.length, returned: ranked.length, limit: cappedLimit },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, errorCode: 'INTERNAL_ERROR', message: 'Server Error' });
  }
};
