const express = require('express');
const router = express.Router();
const {
  getOthers,
  getOthersById,
  createOthers,
  seedOthers
} = require('../controllers/othersController');

// IMPORTANT: Define specific routes BEFORE parameterized routes
// @route   POST /api/others/seed
// @desc    Seed random 50 others products
router.post('/seed', seedOthers);

// @route   GET /api/others
// @desc    Get all others products with optional filtering
router.get('/', getOthers);

// @route   POST /api/others
// @desc    Create an others product
router.post('/', createOthers);

// @route   GET /api/others/:id
// @desc    Get single others product (must be last to avoid conflicts)
router.get('/:id', getOthersById);

module.exports = router;
