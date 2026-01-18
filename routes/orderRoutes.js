const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
} = require('../controllers/orderController');
const { authenticate } = require('../middleware/authMiddleware');

// All order routes are protected
router.use(authenticate);

router.post('/', createOrder);
router.get('/', getOrders);

module.exports = router;
