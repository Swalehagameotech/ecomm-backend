const express = require('express');
const router = express.Router();
const {
  getDiscounts,
  getDiscountById
} = require('../controllers/discountController');

router.get('/', getDiscounts);
router.get('/:id', getDiscountById);

module.exports = router;
