const express = require('express');
const { searchTalent } = require('../controllers/searchController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get(
  '/talent',
  protect,
  authorize('industry_professional', 'pageant_organizer', 'admin'),
  searchTalent,
);

module.exports = router;
