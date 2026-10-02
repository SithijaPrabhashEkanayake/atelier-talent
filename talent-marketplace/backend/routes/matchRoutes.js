const express = require('express');
const { getRecommendationsForModel } = require('../controllers/matchController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/match/recommendations/castings — a model's own top-matching open
// casting calls. The casting-owner-facing equivalent
// (GET /api/castings/:id/recommendations) is nested directly under
// castingRoutes.js instead, since it needs the same ownership check already
// living in castingController.js.
router.get('/recommendations/castings', protect, authorize('model'), getRecommendationsForModel);

module.exports = router;
