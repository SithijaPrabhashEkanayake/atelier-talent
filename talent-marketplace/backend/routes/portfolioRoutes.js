const express = require('express');
const {
  uploadPortfolioItem,
  getPortfolio,
  reorderPortfolioItem,
  deletePortfolioItem,
} = require('../controllers/portfolioController');
const { protect, authorize, optionalProtect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/upload', protect, authorize('model'), upload.single('file'), uploadPortfolioItem);
router.get('/:profileId', optionalProtect, getPortfolio);
router.patch('/:itemId/reorder', protect, authorize('model'), reorderPortfolioItem);
router.delete('/:itemId', protect, authorize('model'), deletePortfolioItem);

module.exports = router;
