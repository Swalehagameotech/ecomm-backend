const express = require('express');
const router = express.Router();
const {
  getFashion,
  getFashionById,
  createFashion,
  seedFashion
} = require('../controllers/fashionController');

// IMPORTANT: Define specific routes BEFORE parameterized routes
// @route   POST /api/fashion/seed
// @desc    Seed random 50 fashion products
router.post('/seed', seedFashion);

// @route   GET /api/fashion
// @desc    Get all fashion with optional filtering
router.get('/', getFashion);

// @route   POST /api/fashion
// @desc    Create a fashion
router.post('/', createFashion);

// @route   GET /api/fashion/:id
// @desc    Get single fashion (must be last to avoid conflicts)
router.get('/:id', getFashionById);

module.exports = router;
