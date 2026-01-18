const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password, // Password will be hashed by the pre-save hook
    });

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during signup',
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during login',
    });
  }
};

// @desc    Create or get user with Firebase UID
// @route   POST /api/auth/firebase-user
// @access  Public (Firebase token verified on frontend)
exports.createOrGetFirebaseUser = async (req, res) => {
  try {
    const { firebaseUID, name, email } = req.body;

    if (!firebaseUID || !email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide firebaseUID and email',
      });
    }

    // Check if user exists by Firebase UID
    let user = await User.findOne({ firebaseUID });

    if (!user) {
      // Check if user exists by email (might be migrating)
      user = await User.findOne({ email: email.toLowerCase() });

      if (user) {
        // Update existing user with Firebase UID
        user.firebaseUID = firebaseUID;
        await user.save();
      } else {
        // Create new user
        user = await User.create({
          firebaseUID,
          name: name || email.split('@')[0],
          email: email.toLowerCase(),
          cart: [],
          cartCount: 0,
          orders: [],
          orderCount: 0,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'User authenticated',
      data: {
        user: {
          id: user._id,
          firebaseUID: user.firebaseUID,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
        },
      },
    });
  } catch (error) {
    console.error('Firebase user error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Protected
exports.getProfile = async (req, res) => {
  try {
    const { firebaseUID } = req.user;
    const user = await User.findOne({ firebaseUID });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          firebaseUID: user.firebaseUID,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          cart: user.cart,
          cartCount: user.cartCount,
        },
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
