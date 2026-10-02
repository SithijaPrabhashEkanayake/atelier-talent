const express = require('express');
const {
  getMyProfile,
  updateMyProfile,
  getProfileById,
  getAllProfiles,
  getPublicShowcase,
} = require('../controllers/profileController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/me', protect, getMyProfile);
router.put('/me', protect, updateMyProfile);

// Public, unauthenticated — a handful of published profiles' names/thumbnails
// for the marketing homepage. Must be registered before `/:id` or Express
// would match "showcase" as an :id value instead.
router.get('/showcase', getPublicShowcase);

router.get(
  '/',
  protect,
  authorize('industry_professional', 'pageant_organizer', 'admin'),
  getAllProfiles,
);
router.get('/:id', protect, getProfileById);

module.exports = router;
