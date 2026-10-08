const express = require('express');
const {
  createCastingCall,
  getCastingCalls,
  getCastingCallById,
  updateCastingCall,
  closeCastingCall,
  getApplicants,
} = require('../controllers/castingController');
const { getRecommendationsForCasting } = require('../controllers/matchController');
const { protect, authorize, optionalProtect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', optionalProtect, getCastingCalls);
router.get('/:id', optionalProtect, getCastingCallById);

router.post(
  '/',
  protect,
  authorize('industry_professional', 'pageant_organizer'),
  createCastingCall,
);
router.put(
  '/:id',
  protect,
  authorize('industry_professional', 'pageant_organizer'),
  updateCastingCall,
);
router.patch(
  '/:id/close',
  protect,
  authorize('industry_professional', 'pageant_organizer'),
  closeCastingCall,
);
router.get(
  '/:id/applicants',
  protect,
  authorize('industry_professional', 'pageant_organizer'),
  getApplicants,
);
// Nested here (rather than under a separate /api/match mount) because it
// needs the exact same "does this organizer own this casting call" check
// that getApplicants already performs — keeping it next to that handler
// avoids re-deriving the ownership rule in a different file.
router.get(
  '/:id/recommendations',
  protect,
  authorize('industry_professional', 'pageant_organizer'),
  getRecommendationsForCasting,
);

module.exports = router;
