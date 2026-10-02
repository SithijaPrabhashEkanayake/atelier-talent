const User = require('../models/User');
const CastingCall = require('../models/CastingCall');
const Application = require('../models/Application');
const ModelProfile = require('../models/ModelProfile');
const IndustryProfile = require('../models/IndustryProfile');
const PageantOrgProfile = require('../models/PageantOrgProfile');
const AdminActionLog = require('../models/AdminActionLog');
const { parsePagination } = require('../utils/pagination');

// Small helper shared by every mutating admin action below — keeps the
// audit trail write a one-liner at each call site and never lets a logging
// failure block the actual moderation action (best-effort, errors are
// swallowed and logged server-side only).
const logAdminAction = async (adminId, action, targetType, targetId, metadata) => {
  try {
    await AdminActionLog.create({ adminId, action, targetType, targetId, metadata });
  } catch (err) {
    console.error('Failed to write admin action log', err);
  }
};

exports.getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeCastings = await CastingCall.countDocuments({ status: 'open' });
    const totalApplications = await Application.countDocuments();
    const totalMatches = await Application.countDocuments({ status: 'accepted' });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeCastings,
        totalApplications,
        totalMatches,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, errorCode: 'INTERNAL_ERROR', message: 'Server Error' });
  }
};

exports.verifyProfile = async (req, res) => {
  try {
    const { profileId } = req.params;

    // The profile could belong to any of the three profile types — try each
    // (mirrors profileController.getProfileById) instead of assuming Model.
    let profile = await ModelProfile.findByIdAndUpdate(
      profileId,
      { isVerified: true },
      { returnDocument: 'after' },
    );
    if (!profile)
      profile = await IndustryProfile.findByIdAndUpdate(
        profileId,
        { isVerified: true },
        { returnDocument: 'after' },
      );
    if (!profile)
      profile = await PageantOrgProfile.findByIdAndUpdate(
        profileId,
        { isVerified: true },
        { returnDocument: 'after' },
      );

    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

    // Real-time Notification
    const notificationService = require('../services/notificationService');
    await notificationService.createNotification({
      userId: profile.userId,
      type: 'system_alert',
      message: 'Congratulations! Your profile has been verified by an admin.',
      link: `/p/${profile._id}`,
      metadata: { profileId: profile._id, isVerified: true },
    });

    await logAdminAction(req.user.id, 'profile.verify', 'profile', profile._id);

    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, errorCode: 'INTERNAL_ERROR', message: 'Server Error' });
  }
};

// @desc    List users (paginated, filterable by role/status)
// @route   GET /api/admin/users
// @access  Admin
exports.getUsers = async (req, res) => {
  try {
    const { role, status } = req.query;
    const { page, limit, skip } = parsePagination(req.query);

    const query = {};
    if (role) query.role = role;
    if (status) query.status = status;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec();

    const count = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: users,
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

// @desc    Suspend a user account
// @route   PATCH /api/admin/users/:id/suspend
// @access  Admin
exports.suspendUser = async (req, res) => {
  try {
    const { id } = req.params;

    // An admin locking themselves out is a real footgun — block it outright.
    if (id === req.user.id.toString()) {
      return res
        .status(400)
        .json({
          success: false,
          errorCode: 'VALIDATION_ERROR',
          message: 'You cannot suspend your own account',
        });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { status: 'Suspended' },
      { returnDocument: 'after' },
    ).select('-password');
    if (!user)
      return res
        .status(404)
        .json({ success: false, errorCode: 'NOT_FOUND', message: 'User not found' });

    await logAdminAction(req.user.id, 'user.suspend', 'user', user._id);

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, errorCode: 'INTERNAL_ERROR', message: 'Server Error' });
  }
};

// @desc    Reactivate a suspended user account
// @route   PATCH /api/admin/users/:id/reactivate
// @access  Admin
exports.reactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user.id.toString()) {
      return res
        .status(400)
        .json({
          success: false,
          errorCode: 'VALIDATION_ERROR',
          message: 'You cannot modify your own account status',
        });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { status: 'Active' },
      { returnDocument: 'after' },
    ).select('-password');
    if (!user)
      return res
        .status(404)
        .json({ success: false, errorCode: 'NOT_FOUND', message: 'User not found' });

    await logAdminAction(req.user.id, 'user.reactivate', 'user', user._id);

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, errorCode: 'INTERNAL_ERROR', message: 'Server Error' });
  }
};

// @desc    Remove (hide) a casting call
// @route   PATCH /api/admin/castings/:id/remove
// @access  Admin
exports.removeCastingCall = async (req, res) => {
  try {
    const castingCall = await CastingCall.findByIdAndUpdate(
      req.params.id,
      { isRemovedByAdmin: true },
      { returnDocument: 'after' },
    );
    if (!castingCall)
      return res
        .status(404)
        .json({ success: false, errorCode: 'NOT_FOUND', message: 'Casting call not found' });

    await logAdminAction(req.user.id, 'casting.remove', 'casting_call', castingCall._id);

    res.status(200).json({ success: true, data: castingCall });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, errorCode: 'INTERNAL_ERROR', message: 'Server Error' });
  }
};

// @desc    Restore a previously admin-removed casting call
// @route   PATCH /api/admin/castings/:id/restore
// @access  Admin
exports.restoreCastingCall = async (req, res) => {
  try {
    const castingCall = await CastingCall.findByIdAndUpdate(
      req.params.id,
      { isRemovedByAdmin: false },
      { returnDocument: 'after' },
    );
    if (!castingCall)
      return res
        .status(404)
        .json({ success: false, errorCode: 'NOT_FOUND', message: 'Casting call not found' });

    await logAdminAction(req.user.id, 'casting.restore', 'casting_call', castingCall._id);

    res.status(200).json({ success: true, data: castingCall });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, errorCode: 'INTERNAL_ERROR', message: 'Server Error' });
  }
};

// @desc    List admin action log entries, newest first
// @route   GET /api/admin/logs
// @access  Admin
exports.getAdminActionLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const logs = await AdminActionLog.find({})
      .populate('adminId', 'email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await AdminActionLog.countDocuments({});

    res.status(200).json({
      success: true,
      data: logs,
      meta: {
        page: Number(page),
        limit: Number(limit),
        totalItems: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, errorCode: 'INTERNAL_ERROR', message: 'Server Error' });
  }
};

module.exports.logAdminAction = logAdminAction;
