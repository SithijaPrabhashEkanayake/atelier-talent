const express = require('express');
const { createReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Any authenticated user may file a report against a user, casting call,
// or profile. The admin-facing moderation queue (GET/PATCH) lives under
// /api/admin/reports instead — see adminRoutes.js — since it's admin-only
// and belongs alongside the rest of the admin surface.
router.post('/', protect, createReport);

module.exports = router;
