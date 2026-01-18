const express = require('express');
const router = express.Router();
const {
  getNewArrivals,
  getNewArrivalById
} = require('../controllers/newArrivalController');

router.get('/', getNewArrivals);
router.get('/:id', getNewArrivalById);

module.exports = router;
