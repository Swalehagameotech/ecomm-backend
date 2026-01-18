const Discount = require('../models/Discount');

exports.getDiscounts = async (req, res) => {
  try {
    const products = await Discount.find({}).sort({ createdAt: -1 }).limit(20);
    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Error fetching discount products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching discount products',
      error: error.message
    });
  }
};

exports.getDiscountById = async (req, res) => {
  try {
    const product = await Discount.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
};
