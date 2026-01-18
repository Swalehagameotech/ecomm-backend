const Footwear = require('../models/Footwear');
const mongoose = require('mongoose');

// @route   GET /api/footwear
// @desc    Get all footwear or filter by category/search
// @access  Public
exports.getFootwear = async (req, res) => {
  try {
    const { category, search, limit = 50 } = req.query;
    
    console.log('📊 Collection name:', Footwear.collection.name);
    const totalCount = await Footwear.countDocuments({});
    console.log(`📦 Total documents in collection: ${totalCount}`);
    
    let query = {};
    
    // Filter by subcategory if provided
    if (category) {
      const categoryMap = {
        'sandal': 'sandals',
        'sandals': 'sandals',
        'boot': 'boots',
        'boots': 'boots',
        'flat': 'flats',
        'flats': 'flats',
        'sneaker': 'sneakers',
        'sneakes': 'sneakers',
        'sneakers': 'sneakers'
      };
      
      const catLower = category.toLowerCase();
      query.subcategory = categoryMap[catLower] || catLower;
      console.log(`🔍 Filtering by subcategory: ${query.subcategory}`);
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
    
    const products = await Footwear.find(query)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    console.log(`✅ Found ${products.length} footwear products`);
    
    res.json({
      success: true,
      count: products.length,
      totalInCollection: totalCount,
      data: products
    });
  } catch (error) {
    console.error('❌ Error fetching footwear:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching footwear',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @route   GET /api/footwear/:id
// @desc    Get single footwear by ID
// @access  Public
exports.getFootwearById = async (req, res) => {
  try {
    const product = await Footwear.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Footwear not found'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching footwear:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching footwear',
      error: error.message
    });
  }
};

// @route   POST /api/footwear
// @desc    Create a new footwear (for seeding data)
// @access  Public (should be protected in production)
exports.createFootwear = async (req, res) => {
  try {
    const product = await Footwear.create(req.body);
    
    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error creating footwear:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating footwear',
      error: error.message
    });
  }
};

// @route   POST /api/footwear/seed
// @desc    Seed random 50 footwear products
// @access  Public (for development)
exports.seedFootwear = async (req, res) => {
  try {
    await Footwear.deleteMany({});
    
    const categories = ['sandals', 'boots', 'flats', 'sneakers'];
    const products = [];
    
    const categoryImages = {
      sandals: "https://res.cloudinary.com/dvkxgrcbv/image/upload/v1767952300/6f3bc9c39d9aaf68516aaa6a1b2053ca_nddgat.jpg",
      boots: "https://res.cloudinary.com/dvkxgrcbv/image/upload/v1767777815/0265d57NK_INC5X00027166_1_hiqbfh.jpg",
      flats: "https://res.cloudinary.com/dvkxgrcbv/image/upload/v1767785267/45f16f44cf935e77f239a5e630e5b43d_ikeegm.jpg",
      sneakers: "https://res.cloudinary.com/dvkxgrcbv/image/upload/v1767968112/-original-imahfevnbhfxktjh_vmukgp.jpg"
    };
    
    for (let i = 1; i <= 50; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const price = Math.floor(Math.random() * 5000) + 500;
      const discountedPrice = price - Math.floor(Math.random() * 200);
      
      products.push({
        name: `${category.charAt(0).toUpperCase() + category.slice(1)} Product ${i}`,
        description: `Stylish and comfortable ${category} perfect for any season, featuring premium materials and craftsmanship.`,
        price: price,
        discounted_price: discountedPrice,
        image: categoryImages[category],
        category: 'footwear',
        subcategory: category,
        stock: Math.floor(Math.random() * 100) + 10
      });
    }
    
    const createdProducts = await Footwear.insertMany(products);
    
    res.json({
      success: true,
      message: `Successfully seeded ${createdProducts.length} footwear products`,
      count: createdProducts.length
    });
  } catch (error) {
    console.error('Error seeding footwear:', error);
    res.status(500).json({
      success: false,
      message: 'Error seeding footwear',
      error: error.message
    });
  }
};
