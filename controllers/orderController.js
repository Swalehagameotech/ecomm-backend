const User = require('../models/User');
const Order = require('../models/Order');

// @desc    Create order
// @route   POST /api/orders
// @access  Protected
exports.createOrder = async (req, res) => {
  try {
    const { firebaseUID } = req.user;
    const { items, totalPrice, email } = req.body;
    console.log('Received Order Request:', { items, totalPrice, email }); // Debug Log

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide order items',
      });
    }

    if (totalPrice === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide total price',
      });
    }

    const user = await User.findOne({ firebaseUID });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prepare products array for Order model
    // Prepare products array for Order model
    const products = items.map(item => ({
      productId: item.productId || item._id || item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image || '',
    }));

    console.log('Mapped Products:', products); // Debug Log

    // Create order in Order model
    const order = await Order.create({
      firebaseUID,
      products,
      totalAmount: totalPrice,
      email: email || user.email,
      status: 'placed',
    });

    // Clear cart
    user.cart = [];
    user.cartCount = 0;
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: {
        order,
      },
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Protected
exports.getOrders = async (req, res) => {
  try {
    const { firebaseUID } = req.user;

    const orders = await Order.find({ firebaseUID }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        orders,
      },
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
