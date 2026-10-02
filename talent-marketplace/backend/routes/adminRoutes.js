const express = require('express');
const {
  getSystemStats,
  verifyProfile,
  getUsers,
  suspendUser,
  reactivateUser,
  removeCastingCall,
  restoreCastingCall,
  getAdminActionLogs,
} = require('../controllers/adminController');
const { getReports, updateReportStatus } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/stats', getSystemStats);
router.patch('/verify-profile/:profileId', verifyProfile);

// User management
router.get('/users', getUsers);
router.patch('/users/:id/suspend', suspendUser);
router.patch('/users/:id/reactivate', reactivateUser);

// Casting call moderation
router.patch('/castings/:id/remove', removeCastingCall);
router.patch('/castings/:id/restore', restoreCastingCall);

// Reports moderation queue
router.get('/reports', getReports);
router.patch('/reports/:id', updateReportStatus);

// Admin action log
router.get('/logs', getAdminActionLogs);

module.exports = router;
