const express = require('express');
const {
  applyToCasting,
  getMyApplications,
  updateApplicationStatus,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, authorize('model'), applyToCasting);
router.get('/me', protect, authorize('model'), getMyApplications);
router.patch(
  '/:id/status',
  protect,
  authorize('industry_professional', 'pageant_organizer'),
  updateApplicationStatus,
);

module.exports = router;
