const Fashion = require('../models/Fashion');
const mongoose = require('mongoose');

// @route   GET /api/fashion
// @desc    Get all fashion or filter by category/search
// @access  Public
exports.getFashion = async (req, res) => {
  try {
    const { category, search, limit = 50 } = req.query;
    
    console.log('📊 Collection name:', Fashion.collection.name);
    const totalCount = await Fashion.countDocuments({});
    console.log(`📦 Total documents in collection: ${totalCount}`);
    
    let query = {};
    
    // Filter by subcategory if provided
    if (category) {
      const categoryMap = {
        'comfy': 'comfy',
        'kurta': 'kurta',
        'belt': 'belts',
        'belts': 'belts',
        'scarf': 'scarf'
      };
      
      const catLower = category.toLowerCase();
      const subcategoryValue = categoryMap[catLower] || catLower;
      query.subcategory = { $regex: subcategoryValue, $options: 'i' };
      console.log(`🔍 Filtering by subcategory: ${subcategoryValue}`);
    }
    
    // Search in name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
      console.log(`🔍 Searching for: ${search}`);
    }
    
    console.log('🔍 Final query:', JSON.stringify(query, null, 2));
    
    const products = await Fashion.find(query)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    console.log(`✅ Found ${products.length} fashion products`);
    
    res.json({
      success: true,
      count: products.length,
      totalInCollection: totalCount,
      data: products
    });
  } catch (error) {
    console.error('❌ Error fetching fashion:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching fashion',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @route   GET /api/fashion/:id
// @desc    Get single fashion by ID
// @access  Public
exports.getFashionById = async (req, res) => {
  try {
    const product = await Fashion.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Fashion not found'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching fashion:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching fashion',
      error: error.message
    });
  }
};

// @route   POST /api/fashion
// @desc    Create a new fashion (for seeding data)
// @access  Public (should be protected in production)
exports.createFashion = async (req, res) => {
  try {
    const product = await Fashion.create(req.body);
    
    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error creating fashion:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating fashion',
      error: error.message
    });
  }
};

// @route   POST /api/fashion/seed
// @desc    Seed random 50 fashion products
// @access  Public (for development)
exports.seedFashion = async (req, res) => {
  try {
    await Fashion.deleteMany({});
    
    const categories = ['comfy', 'kurta', 'belts', 'scarf'];
    const products = [];
    
    const categoryImages = {
      comfy: "https://res.cloudinary.com/dvkxgrcbv/image/upload/v1764940680/10096_lj31j3.jpg",
      kurta: "https://res.cloudinary.com/dvkxgrcbv/image/upload/v1764933735/937_utbiaz.jpg",
      belts: "https://res.cloudinary.com/dvkxgrcbv/image/upload/v1765545677/one-size-women-fancy-lether-belt-women-belt-lether-pu-belt-original-imahffzgerpejme3_j0merd.jpg",
      scarf: "https://res.cloudinary.com/dvkxgrcbv/image/upload/v1765300508/images_m1r5in.jpg"
    };
    
    for (let i = 1; i <= 50; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const price = Math.floor(Math.random() * 5000) + 500;
      const discountedPrice = price - Math.floor(Math.random() * 200);
      
      products.push({
        name: `${category.charAt(0).toUpperCase() + category.slice(1)} Product ${i}`,
        description: `Stylish and elegant ${category} perfect for any occasion, featuring premium materials and craftsmanship.`,
        price: price,
        discounted_price: discountedPrice,
        image: categoryImages[category],
        category: 'fashion',
        subcategory: category,
        stock: Math.floor(Math.random() * 100) + 10
      });
    }
    
    const createdProducts = await Fashion.insertMany(products);
    
    res.json({
      success: true,
      message: `Successfully seeded ${createdProducts.length} fashion products`,
      count: createdProducts.length
    });
  } catch (error) {
    console.error('Error seeding fashion:', error);
    res.status(500).json({
      success: false,
      message: 'Error seeding fashion',
      error: error.message
    });
  }
};
