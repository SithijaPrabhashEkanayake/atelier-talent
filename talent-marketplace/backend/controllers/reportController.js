const Report = require('../models/Report');
const { logAdminAction } = require('./adminController');
const { parsePagination } = require('../utils/pagination');

const TARGET_TYPES = ['user', 'casting_call', 'profile'];
const REPORT_STATUSES = ['open', 'reviewed', 'dismissed'];

// @desc    File a report against a user, casting call, or profile
// @route   POST /api/reports
// @access  Private (any authenticated user)
exports.createReport = async (req, res) => {
  try {
    const { targetType, targetId, reason } = req.body;

    if (!TARGET_TYPES.includes(targetType)) {
      return res.status(400).json({
        success: false,
        errorCode: 'VALIDATION_ERROR',
        message: `targetType must be one of: ${TARGET_TYPES.join(', ')}`,
      });
    }
    if (!targetId) {
      return res
        .status(400)
        .json({ success: false, errorCode: 'VALIDATION_ERROR', message: 'targetId is required' });
    }
    if (!reason || !reason.trim()) {
      return res
        .status(400)
        .json({ success: false, errorCode: 'VALIDATION_ERROR', message: 'reason is required' });
    }

    const report = await Report.create({
      reporterId: req.user.id,
      targetType,
      targetId,
      reason: reason.trim(),
    });

    res.status(201).json({ success: true, data: report });
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError' || err.name === 'CastError') {
      return res
        .status(400)
        .json({ success: false, errorCode: 'VALIDATION_ERROR', message: err.message });
    }
    res.status(500).json({ success: false, errorCode: 'INTERNAL_ERROR', message: 'Server Error' });
  }
};

// @desc    List reports (paginated, filterable by status)
// @route   GET /api/admin/reports
// @access  Admin
exports.getReports = async (req, res) => {
  try {
    const { status } = req.query;
    const { page, limit, skip } = parsePagination(req.query);

    const query = {};
    if (status) query.status = status;

    const reports = await Report.find(query)
      .populate('reporterId', 'email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec();

    const count = await Report.countDocuments(query);

    res.status(200).json({
      success: true,
      data: reports,
      meta: {
        page,
        limit,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, errorCode: 'INTERNAL_ERROR', message: 'Server Error' });
  }
};

// @desc    Update a report's status (reviewed/dismissed/open)
// @route   PATCH /api/admin/reports/:id
// @access  Admin
exports.updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!REPORT_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        errorCode: 'VALIDATION_ERROR',
        message: `status must be one of: ${REPORT_STATUSES.join(', ')}`,
      });
    }

    const report = await Report.findByIdAndUpdate(id, { status }, { returnDocument: 'after' });
    if (!report)
      return res
        .status(404)
        .json({ success: false, errorCode: 'NOT_FOUND', message: 'Report not found' });

    await logAdminAction(req.user.id, 'report.resolve', 'report', report._id, { status });

    res.status(200).json({ success: true, data: report });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, errorCode: 'INTERNAL_ERROR', message: 'Server Error' });
  }
};
