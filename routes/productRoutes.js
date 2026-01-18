const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  seedProducts
} = require('../controllers/productController');

// IMPORTANT: Define specific routes BEFORE parameterized routes
// @route   POST /api/products/seed
// @desc    Seed random 50 products
router.post('/seed', seedProducts);

// @route   GET /api/products
// @desc    Get all products with optional filtering
router.get('/', getProducts);

// @route   POST /api/products
// @desc    Create a product
router.post('/', createProduct);

// @route   GET /api/products/:id
// @desc    Get single product (must be last to avoid conflicts)
router.get('/:id', getProductById);

module.exports = router;
