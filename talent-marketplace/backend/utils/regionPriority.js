const PRIORITY_COUNTRY = 'Sri Lanka';

// Aggregation stages that rank Sri Lankan records ahead of everything else.
// Sorting in the database (rather than in JS after paging) keeps pagination
// and totals correct across pages.
const priorityRankStage = {
  $addFields: {
    _priorityRank: { $cond: [{ $eq: ['$country', PRIORITY_COUNTRY] }, 0, 1] },
  },
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports = { PRIORITY_COUNTRY, priorityRankStage, escapeRegex };
