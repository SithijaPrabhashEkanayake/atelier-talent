const ModelProfile = require('../models/ModelProfile');
const IndustryProfile = require('../models/IndustryProfile');
const PageantOrgProfile = require('../models/PageantOrgProfile');
const PortfolioItem = require('../models/PortfolioItem');
const { parsePagination } = require('../utils/pagination');
const { priorityRankStage } = require('../utils/regionPriority');

// Helper function to get the correct model based on user role
const getProfileModel = (role) => {
  switch (role) {
    case 'model':
      return ModelProfile;
    case 'industry_professional':
      return IndustryProfile;
    case 'pageant_organizer':
      return PageantOrgProfile;
    default:
      return null;
  }
};

// Allowlist, not denylist: only fields listed here can be set through the
// self-service update endpoint. A denylist (block userId/_id/isVerified,
// allow everything else) silently permits any future field added to a
// profile schema — including a future admin-only one — unless someone
// remembers to blacklist it too. isVerified/isPublished-as-moderation-flag
// style fields are deliberately left off every list below.
const SELF_UPDATABLE_FIELDS = {
  model: [
    'fullName',
    'country',
    'dateOfBirth',
    'heightCm',
    'measurements',
    'category',
    'representationStatus',
    'agencyName',
    'experience',
    'skills',
    'socialLinks',
    'isPublished',
  ],
  industry_professional: [
    'organizationName',
    'organizationType',
    'country',
    'description',
    'website',
    'isPublished',
  ],
  pageant_organizer: [
    'organizationName',
    'country',
    'pageantHistory',
    'officialStatus',
    'isPublished',
  ],
};

const pickSelfUpdatableFields = (role, body) => {
  const payload = {};
  for (const field of SELF_UPDATABLE_FIELDS[role] || []) {
    if (Object.prototype.hasOwnProperty.call(body, field)) payload[field] = body[field];
  }
  return payload;
};

exports.getMyProfile = async (req, res) => {
  try {
    const ProfileModel = getProfileModel(req.user.role);
    if (!ProfileModel)
      return res
        .status(400)
        .json({
          success: false,
          errorCode: 'VALIDATION_ERROR',
          message: 'Invalid role for profile',
        });

    const profile = await ProfileModel.findOne({ userId: req.user.id });
    if (!profile) {
      return res
        .status(404)
        .json({ success: false, errorCode: 'NOT_FOUND', message: 'Profile not found' });
    }

    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, errorCode: 'INTERNAL_ERROR', message: 'Server Error' });
  }
};

exports.updateMyProfile = async (req, res) => {
  try {
    const ProfileModel = getProfileModel(req.user.role);
    if (!ProfileModel)
      return res
        .status(400)
        .json({
          success: false,
          errorCode: 'VALIDATION_ERROR',
          message: 'Invalid role for profile',
        });

    // Enforce basic business rules
    if (
      req.user.role === 'model' &&
      req.body.representationStatus === 'agency_represented' &&
      !req.body.agencyName
    ) {
      return res
        .status(400)
        .json({
          success: false,
          errorCode: 'VALIDATION_ERROR',
          message: 'Agency name is required when agency represented',
        });
    }

    // Only fields on this role's allowlist survive — ownership (userId) and
    // admin-controlled fields (isVerified) are never in that list, so they
    // can't be set here regardless of what the request body contains.
    const payload = pickSelfUpdatableFields(req.user.role, req.body);
    payload.userId = req.user.id;

    const profile = await ProfileModel.findOneAndUpdate(
      { userId: req.user.id },
      { $set: payload },
      { returnDocument: 'after', upsert: true, runValidators: true },
    );

    res.status(200).json({ success: true, data: profile });
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

exports.getProfileById = async (req, res) => {
  try {
    const { id } = req.params;

    // We don't know the role from the ID, so we try to find it in any of them
    // Ideally we would look up the user first, but we can do a quick parallel search
    const [model, industry, pageant] = await Promise.all([
      ModelProfile.findById(id),
      IndustryProfile.findById(id),
      PageantOrgProfile.findById(id),
    ]);

    const profile = model || industry || pageant;

    if (!profile) {
      return res
        .status(404)
        .json({ success: false, errorCode: 'NOT_FOUND', message: 'Profile not found' });
    }

    const isOwner = profile.userId.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!profile.isPublished && !isOwner && !isAdmin) {
      return res
        .status(404)
        .json({ success: false, errorCode: 'NOT_FOUND', message: 'Profile not found' });
    }

    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, errorCode: 'INTERNAL_ERROR', message: 'Server Error' });
  }
};

// Public, unauthenticated homepage teaser — only ever exposes fields that
// are already public once a profile is published (name, country, category,
// verified badge, one thumbnail). No email, measurements, or DOB.
exports.getPublicShowcase = async (req, res) => {
  try {
    const profiles = await ModelProfile.aggregate([
      { $match: { isPublished: true } },
      priorityRankStage,
      { $sort: { _priorityRank: 1, isVerified: -1, createdAt: -1, _id: 1 } },
      { $limit: 8 },
      {
        $project: {
          fullName: 1,
          country: 1,
          category: 1,
          isVerified: 1,
          heightCm: 1,
          measurements: 1,
        },
      },
    ]);

    const withThumbnails = await Promise.all(
      profiles.map(async (p) => {
        const item = await PortfolioItem.findOne({ modelProfileId: p._id }).sort({ sortOrder: 1 });
        return {
          id: p._id,
          fullName: p.fullName,
          country: p.country,
          category: p.category,
          isVerified: p.isVerified,
          heightCm: p.heightCm,
          measurements: p.measurements,
          thumbnailUrl: item?.thumbnailUrl || null,
        };
      }),
    );

    res.status(200).json({ success: true, data: withThumbnails });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, errorCode: 'INTERNAL_ERROR', message: 'Server Error' });
  }
};

exports.getAllProfiles = async (req, res) => {
  // Skeleton for search/browse
  try {
    const { role, country, category } = req.query;
    const { page, limit, skip } = parsePagination(req.query);

    let ProfileModel = ModelProfile;
    if (role === 'industry_professional') ProfileModel = IndustryProfile;
    if (role === 'pageant_organizer') ProfileModel = PageantOrgProfile;

    const query = { isPublished: true };
    if (country) query.country = country;
    if (category && role === 'model') query.category = category;

    const profiles = await ProfileModel.find(query).limit(limit).skip(skip).exec();

    const count = await ProfileModel.countDocuments(query);

    res.status(200).json({
      success: true,
      data: profiles,
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
