const PortfolioItem = require('../models/PortfolioItem');
const ModelProfile = require('../models/ModelProfile');
const cloudinary = require('../config/cloudinary');

exports.uploadPortfolioItem = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, errorCode: 'VALIDATION_ERROR', message: 'No file uploaded' });
    }

    const { type, category } = req.body;
    if (!type || !category) {
      return res
        .status(400)
        .json({
          success: false,
          errorCode: 'VALIDATION_ERROR',
          message: 'Type and category required',
        });
    }

    // Ensure user has a profile
    const profile = await ModelProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res
        .status(404)
        .json({
          success: false,
          errorCode: 'NOT_FOUND',
          message: 'Please complete your model profile first.',
        });
    }

    const mediaUrl = req.file.path;
    // multer-storage-cloudinary sets `.filename` to the Cloudinary public_id
    // (not the original filename) — needed both to build a real derived
    // thumbnail and to delete the asset later.
    const publicId = req.file.filename;
    const thumbnailUrl =
      type === 'video'
        ? cloudinary.url(publicId, {
            resource_type: 'video',
            width: 400,
            height: 400,
            crop: 'fill',
            format: 'jpg',
          })
        : cloudinary.url(publicId, { width: 400, height: 400, crop: 'fill', quality: 'auto' });

    const count = await PortfolioItem.countDocuments({ modelProfileId: profile._id });

    const portfolioItem = await PortfolioItem.create({
      modelProfileId: profile._id,
      type,
      category,
      mediaUrl,
      thumbnailUrl,
      publicId,
      fileSizeBytes: req.file.size,
      sortOrder: count, // Append to end
    });

    res.status(201).json({ success: true, data: portfolioItem });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, errorCode: 'INTERNAL_ERROR', message: 'Server Error' });
  }
};

exports.getPortfolio = async (req, res) => {
  try {
    const { profileId } = req.params;

    const profile = await ModelProfile.findById(profileId);
    if (!profile) {
      return res
        .status(404)
        .json({ success: false, errorCode: 'NOT_FOUND', message: 'Profile not found' });
    }

    const isOwner = profile.userId.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!profile.isPublished && !isOwner && !isAdmin) {
      return res
        .status(404)
        .json({ success: false, errorCode: 'NOT_FOUND', message: 'Profile not found' });
    }

    const items = await PortfolioItem.find({ modelProfileId: profileId }).sort({ sortOrder: 1 });
    res.status(200).json({ success: true, data: items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, errorCode: 'INTERNAL_ERROR', message: 'Server Error' });
  }
};

exports.reorderPortfolioItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { sortOrder } = req.body;

    const item = await PortfolioItem.findById(itemId).populate('modelProfileId');
    if (!item)
      return res
        .status(404)
        .json({ success: false, errorCode: 'NOT_FOUND', message: 'Item not found' });

    if (item.modelProfileId.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, errorCode: 'FORBIDDEN', message: 'Not authorized' });
    }

    item.sortOrder = sortOrder;
    await item.save();

    res.status(200).json({ success: true, data: item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, errorCode: 'INTERNAL_ERROR', message: 'Server Error' });
  }
};

exports.deletePortfolioItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const item = await PortfolioItem.findById(itemId).populate('modelProfileId');
    if (!item)
      return res
        .status(404)
        .json({ success: false, errorCode: 'NOT_FOUND', message: 'Item not found' });

    if (item.modelProfileId.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, errorCode: 'FORBIDDEN', message: 'Not authorized' });
    }

    // Clean up the Cloudinary asset too — items without a publicId (e.g.
    // seeded demo data pointing at external placeholder images) skip this.
    if (item.publicId) {
      try {
        await cloudinary.uploader.destroy(item.publicId, {
          resource_type: item.type === 'video' ? 'video' : 'image',
        });
      } catch (cloudErr) {
        console.error('Cloudinary asset deletion failed (continuing anyway):', cloudErr.message);
      }
    }

    await PortfolioItem.deleteOne({ _id: itemId });

    res.status(204).json({ success: true, data: {} });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, errorCode: 'INTERNAL_ERROR', message: 'Server Error' });
  }
};
