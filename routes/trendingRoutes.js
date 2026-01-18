const express = require('express');
const router = express.Router();
const {
  getTrending,
  getTrendingById
} = require('../controllers/trendingController');

router.get('/', getTrending);
router.get('/:id', getTrendingById);

module.exports = router;
