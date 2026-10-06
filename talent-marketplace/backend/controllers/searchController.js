const ModelProfile = require('../models/ModelProfile');
const PortfolioItem = require('../models/PortfolioItem');
const { parsePagination } = require('../utils/pagination');
const { priorityRankStage, escapeRegex } = require('../utils/regionPriority');

// ModelProfile has no direct experience-level field, so we derive a coarse
// level from the length of its `experience` array (each entry is one prior
// job/credit — title, organization, year, description). Thresholds are a
// judgment call, not a documented business rule:
//   0 entries      -> 'beginner'
//   1-2 entries    -> 'intermediate'
//   3+ entries     -> 'experienced'
// This is necessarily approximate (a single multi-year agency credit reads
// the same as a single one-day extra job), but it's a reasonable, cheap
// proxy and strictly better than not filtering on the field at all.
const EXPERIENCE_LEVELS = ['beginner', 'intermediate', 'experienced'];
const deriveExperienceLevel = (experienceCount) => {
  if (experienceCount >= 3) return 'experienced';
  if (experienceCount >= 1) return 'intermediate';
  return 'beginner';
};

exports.searchTalent = async (req, res) => {
  try {
    const { country, category, minAge, maxAge, minHeightCm, maxHeightCm, experienceLevel, skills } =
      req.query;
    const { page, limit, skip } = parsePagination(req.query);

    const query = { isPublished: true };

    if (country) query.country = { $regex: `^${escapeRegex(country.trim())}$`, $options: 'i' };
    if (category) query.category = category;

    // Height filtering
    if (minHeightCm || maxHeightCm) {
      query.heightCm = {};
      if (minHeightCm) query.heightCm.$gte = Number(minHeightCm);
      if (maxHeightCm) query.heightCm.$lte = Number(maxHeightCm);
    }

    // Age filtering (calculating DOB bounds)
    if (minAge || maxAge) {
      query.dateOfBirth = {};
      const today = new Date();
      if (maxAge) {
        const minDate = new Date(
          today.getFullYear() - Number(maxAge) - 1,
          today.getMonth(),
          today.getDate() + 1,
        );
        query.dateOfBirth.$gte = minDate;
      }
      if (minAge) {
        const maxDate = new Date(
          today.getFullYear() - Number(minAge),
          today.getMonth(),
          today.getDate(),
        );
        query.dateOfBirth.$lte = maxDate;
      }
    }

    // Skills filtering (simple substring match on the array for now, or exact match if multiple provided)
    if (skills) {
      const skillsArray = skills.split(',').map((s) => s.trim());
      query.skills = { $in: skillsArray }; // Matches any of the provided skills
    }

    // Experience-level matching, derived from experience-array length (see
    // deriveExperienceLevel/EXPERIENCE_LEVELS above). Filtering directly in
    // the query (via $expr on $size) rather than in JS after the fact keeps
    // pagination/counts correct without needing an aggregation pipeline.
    // hasPortfolio check remains unimplemented — ModelProfile has no
    // boolean/derivable portfolio-presence signal to filter on yet.
    if (experienceLevel && EXPERIENCE_LEVELS.includes(experienceLevel)) {
      const sizeExpr = { $size: { $ifNull: ['$experience', []] } };
      if (experienceLevel === 'beginner') {
        query.$expr = { $eq: [sizeExpr, 0] };
      } else if (experienceLevel === 'intermediate') {
        query.$expr = { $and: [{ $gte: [sizeExpr, 1] }, { $lte: [sizeExpr, 2] }] };
      } else if (experienceLevel === 'experienced') {
        query.$expr = { $gte: [sizeExpr, 3] };
      }
    }

    const profiles = await ModelProfile.aggregate([
      { $match: query },
      priorityRankStage,
      { $sort: { _priorityRank: 1, _id: 1 } },
      { $skip: skip },
      { $limit: limit },
      { $project: { _priorityRank: 0 } },
    ]);

    const count = await ModelProfile.countDocuments(query);

    // Surface the derived level alongside each profile so a client that
    // filtered by experienceLevel can also display/label it, rather than
    // silently applying a heuristic the caller can't see. Also attach a
    // thumbnail (first portfolio item, if any) so result cards don't have
    // to render a blank/placeholder box for every single result.
    const enrichedProfiles = await Promise.all(
      profiles.map(async (profile) => {
        const item = await PortfolioItem.findOne({ modelProfileId: profile._id }).sort({
          sortOrder: 1,
        });
        return {
          ...profile,
          derivedExperienceLevel: deriveExperienceLevel((profile.experience || []).length),
          thumbnailUrl: item?.thumbnailUrl || null,
        };
      }),
    );

    res.status(200).json({
      success: true,
      data: enrichedProfiles,
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
