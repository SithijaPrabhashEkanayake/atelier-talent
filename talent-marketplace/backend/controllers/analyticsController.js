const User = require('../models/User');
const CastingCall = require('../models/CastingCall');
const Application = require('../models/Application');
const ModelProfile = require('../models/ModelProfile');
const Message = require('../models/Message');

/**
 * Helper to build daily time-series buckets from MongoDB aggregation.
 */
function fillTimeSeries(rawBuckets, days = 30) {
  const result = [];
  const map = new Map();

  for (const b of rawBuckets) {
    map.set(b._id, b.count);
  }

  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    result.push({
      date: dateStr,
      count: map.get(dateStr) || 0,
    });
  }

  return result;
}

// GET /api/admin/analytics/overview
exports.getOverview = async (req, res) => {
  try {
    const days = Math.min(Math.max(Number(req.query.days) || 30, 7), 90);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [
      totalUsers,
      totalCastings,
      totalApplications,
      totalMatches,
      userRegistrations,
      castingCreations,
      applicationSubmissions,
    ] = await Promise.all([
      User.countDocuments(),
      CastingCall.countDocuments(),
      Application.countDocuments(),
      Application.countDocuments({ status: 'accepted' }),
      User.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      CastingCall.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Application.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const registrationSeries = fillTimeSeries(userRegistrations, days);
    const castingSeries = fillTimeSeries(castingCreations, days);
    const applicationSeries = fillTimeSeries(applicationSubmissions, days);

    // Merge into combined time-series records for multi-series charting
    const combinedSeries = registrationSeries.map((item, idx) => ({
      date: item.date,
      registrations: item.count,
      castings: castingSeries[idx]?.count || 0,
      applications: applicationSeries[idx]?.count || 0,
    }));

    res.status(200).json({
      success: true,
      data: {
        totals: {
          users: totalUsers,
          castings: totalCastings,
          applications: totalApplications,
          matches: totalMatches,
        },
        timeSeries: combinedSeries,
        windowDays: days,
      },
    });
  } catch (err) {
    console.error('Analytics overview error:', err);
    res
      .status(500)
      .json({
        success: false,
        errorCode: 'INTERNAL_ERROR',
        message: 'Failed to compute overview analytics',
      });
  }
};

// GET /api/admin/analytics/demographics
exports.getDemographics = async (req, res) => {
  try {
    const [roles, modelCategories, castingCategories, topCountries] = await Promise.all([
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      ModelProfile.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
      CastingCall.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
      ModelProfile.aggregate([
        { $match: { country: { $exists: true, $ne: '' } } },
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        roleDistribution: roles.map((r) => ({ role: r._id || 'unknown', count: r.count })),
        modelCategories: modelCategories.map((c) => ({
          category: c._id || 'unspecified',
          count: c.count,
        })),
        castingCategories: castingCategories.map((c) => ({
          category: c._id || 'unspecified',
          count: c.count,
        })),
        topCountries: topCountries.map((c) => ({ country: c._id, count: c.count })),
      },
    });
  } catch (err) {
    console.error('Analytics demographics error:', err);
    res
      .status(500)
      .json({
        success: false,
        errorCode: 'INTERNAL_ERROR',
        message: 'Failed to compute demographics',
      });
  }
};

// GET /api/admin/analytics/engagement
exports.getEngagement = async (req, res) => {
  try {
    const [applicationStatuses, totalMessages, verifiedModelsCount, totalModelsCount] =
      await Promise.all([
        Application.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
        Message.countDocuments(),
        ModelProfile.countDocuments({ isVerified: true }),
        ModelProfile.countDocuments(),
      ]);

    const statusCounts = {
      submitted: 0,
      shortlisted: 0,
      accepted: 0,
      rejected: 0,
    };
    let totalApps = 0;
    applicationStatuses.forEach((s) => {
      if (statusCounts[s._id] !== undefined) {
        statusCounts[s._id] = s.count;
      }
      totalApps += s.count;
    });

    const acceptanceRate =
      totalApps > 0 ? Math.round((statusCounts.accepted / totalApps) * 100) : 0;
    const shortlistRate =
      totalApps > 0 ? Math.round((statusCounts.shortlisted / totalApps) * 100) : 0;
    const verificationRate =
      totalModelsCount > 0 ? Math.round((verifiedModelsCount / totalModelsCount) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        applicationFunnel: [
          { stage: 'Submitted', count: statusCounts.submitted },
          { stage: 'Shortlisted', count: statusCounts.shortlisted },
          { stage: 'Accepted', count: statusCounts.accepted },
          { stage: 'Rejected', count: statusCounts.rejected },
        ],
        metrics: {
          acceptanceRate,
          shortlistRate,
          verificationRate,
          totalMessagesExchanged: totalMessages,
          totalTalentRegistered: totalModelsCount,
        },
      },
    });
  } catch (err) {
    console.error('Analytics engagement error:', err);
    res
      .status(500)
      .json({
        success: false,
        errorCode: 'INTERNAL_ERROR',
        message: 'Failed to compute engagement metrics',
      });
  }
};
