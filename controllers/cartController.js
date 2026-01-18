const User = require('../models/User');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Protected (via Firebase UID)
exports.getCart = async (req, res) => {
  try {
    const { firebaseUID } = req.user;

    const user = await User.findOne({ firebaseUID });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        cart: user.cart,
        cartCount: user.cartCount,
      },
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Protected
exports.addToCart = async (req, res) => {
  try {
    const { firebaseUID } = req.user;
    const { productId, name, price, quantity, image } = req.body;

    if (!productId || !name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide productId, name, and price',
      });
    }

    const user = await User.findOne({ firebaseUID });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const existingItemIndex = user.cart.findIndex(
      (item) => item.productId === productId
    );

    if (existingItemIndex >= 0) {
      // Update quantity
      user.cart[existingItemIndex].quantity += quantity || 1;
      user.cartCount += quantity || 1;
    } else {
      // Add new item
      user.cart.push({
        productId,
        name,
        price,
        quantity: quantity || 1,
        image: image || '',
      });
      user.cartCount += quantity || 1;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      data: {
        cart: user.cart,
        cartCount: user.cartCount,
      },
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Protected
exports.updateCartItem = async (req, res) => {
  try {
    const { firebaseUID } = req.user;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid quantity',
      });
    }

    const user = await User.findOne({ firebaseUID });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const itemIndex = user.cart.findIndex(
      (item) => item.productId === productId
    );

    if (itemIndex < 0) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart',
      });
    }

    const oldQuantity = user.cart[itemIndex].quantity;

    if (quantity === 0) {
      // Remove item
      user.cart.splice(itemIndex, 1);
      user.cartCount -= oldQuantity;
    } else {
      // Update quantity
      user.cart[itemIndex].quantity = quantity;
      user.cartCount = user.cartCount - oldQuantity + quantity;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Cart updated',
      data: {
        cart: user.cart,
        cartCount: user.cartCount,
      },
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Protected
exports.removeFromCart = async (req, res) => {
  try {
    const { firebaseUID } = req.user;
    const { productId } = req.params;

    const user = await User.findOne({ firebaseUID });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const itemIndex = user.cart.findIndex(
      (item) => item.productId === productId
    );

    if (itemIndex < 0) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart',
      });
    }

    const removedQuantity = user.cart[itemIndex].quantity;
    user.cart.splice(itemIndex, 1);
    user.cartCount -= removedQuantity;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: {
        cart: user.cart,
        cartCount: user.cartCount,
      },
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Protected
exports.clearCart = async (req, res) => {
  try {
    const { firebaseUID } = req.user;

    const user = await User.findOne({ firebaseUID });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.cart = [];
    user.cartCount = 0;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Cart cleared',
      data: {
        cart: user.cart,
        cartCount: user.cartCount,
      },
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
