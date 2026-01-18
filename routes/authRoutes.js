const express = require('express');
const router = express.Router();
const { signup, login, createOrGetFirebaseUser } = require('../controllers/authController');

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', signup);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', login);

// @route   POST /api/auth/firebase-user
// @desc    Create or get user with Firebase UID
// @access  Public
router.post('/firebase-user', createOrGetFirebaseUser);

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Protected
const { authenticate } = require('../middleware/authMiddleware');
router.get('/profile', authenticate, require('../controllers/authController').getProfile);

module.exports = router;
