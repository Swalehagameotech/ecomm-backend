const express = require('express');
const router = express.Router();
const {
  getFootwear,
  getFootwearById,
  createFootwear,
  seedFootwear
} = require('../controllers/footwearController');

// IMPORTANT: Define specific routes BEFORE parameterized routes
// @route   POST /api/footwear/seed
// @desc    Seed random 50 footwear products
router.post('/seed', seedFootwear);

// @route   GET /api/footwear
// @desc    Get all footwear with optional filtering
router.get('/', getFootwear);

// @route   POST /api/footwear
// @desc    Create a footwear
router.post('/', createFootwear);

// @route   GET /api/footwear/:id
// @desc    Get single footwear (must be last to avoid conflicts)
router.get('/:id', getFootwearById);

module.exports = router;
