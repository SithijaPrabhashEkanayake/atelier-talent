const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All analytics routes require authenticated admin access
router.use(protect, authorize('admin'));

router.get('/overview', analyticsController.getOverview);
router.get('/demographics', analyticsController.getDemographics);
router.get('/engagement', analyticsController.getEngagement);

module.exports = router;
