// Forwarding and wrapper for matchingEngine service
// Preserves exact signature for existing callers while adding explainability
const matchingEngine = require('../services/matchingEngine');

module.exports = {
  computeMatchScore: matchingEngine.computeMatchScore,
  getAgeFromDOB: matchingEngine.getAgeFromDOB,
  DEFAULT_WEIGHTS: matchingEngine.DEFAULT_WEIGHTS,
  CATEGORY_AFFINITY: matchingEngine.CATEGORY_AFFINITY,
};
