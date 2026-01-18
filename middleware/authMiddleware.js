// Middleware to extract Firebase UID from request headers
// Frontend will send firebaseUID in headers after Firebase authentication

exports.authenticate = async (req, res, next) => {
  try {
    const firebaseUID = req.headers['x-firebase-uid'];

    if (!firebaseUID) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login.',
      });
    }

    // Attach user info to request
    req.user = { firebaseUID };
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};
