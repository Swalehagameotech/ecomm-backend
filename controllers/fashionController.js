const Fashion = require('../models/Fashion');
const mongoose = require('mongoose');

// @route   GET /api/fashion
// @desc    Get all fashion or filter by category/search
// @access  Public
exports.getFashion = async (req, res) => {
  try {
    const { category, subcategory, search, limit = 50 } = req.query;
    
    console.log('📊 Collection name:', Fashion.collection.name);
    const totalCount = await Fashion.countDocuments({});
    console.log(`📦 Total documents in collection: ${totalCount}`);
    
    let query = {};
    
    // Filter by subcategory if provided (support both category and subcategory params)
    const filterValue = subcategory || category;
    console.log(`🔍 Received params - subcategory: "${subcategory}", category: "${category}", filterValue: "${filterValue}"`);
    
    if (filterValue) {
      const catLower = filterValue.toLowerCase().trim();
      
      // Map to the actual database subcategory values
      const subcategoryMap = {
        'kurta': 'kurtas',  // Database has "kurtas" (plural)
        'kurtas': 'kurtas',
        'scarf': 'scarfs',  // Database has "scarfs" (plural)
        'scarfs': 'scarfs',
        'belt': 'belts',    // Database has "belts" (plural)
        'belts': 'belts',
        'comfy': 'comfy'    // Database has "comfy"
      };
      
      const dbSubcategory = subcategoryMap[catLower] || catLower;
      
      // Use exact match (case-insensitive) since we know the exact database values
      query.subcategory = { $regex: `^${dbSubcategory}$`, $options: 'i' };
      console.log(`🔍 Filtering by subcategory: "${catLower}" → database value: "${dbSubcategory}"`);
      console.log(`🔍 Regex pattern: ^${dbSubcategory}$`);
    }
    
    // Search in name or description (combine with subcategory filter if both exist)
    if (search) {
      const searchConditions = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
      
      // If subcategory filter exists, combine with search using $and
      if (query.subcategory) {
        const subcategoryFilter = query.subcategory;
        delete query.subcategory;
        query.$and = [
          { subcategory: subcategoryFilter },
          { $or: searchConditions }
        ];
      } else {
        query.$or = searchConditions;
      }
      console.log(`🔍 Searching for: ${search}`);
    }
    
    console.log('🔍 Final query:', JSON.stringify(query, null, 2));
    
    // Debug: Check all unique subcategories in database
    const uniqueSubcategories = await Fashion.distinct('subcategory');
    console.log(`📋 All unique subcategories in database:`, uniqueSubcategories);
    
    // Debug: Check count for specific subcategory if filtering
    if (filterValue) {
      const catLower = filterValue.toLowerCase().trim();
      const categoryMap = {
        'comfy': 'comfy',
        'kurta': 'kurtas',  // Map kurta to kurtas (plural in database)
        'kurtas': 'kurtas',
        'belt': 'belts',
        'belts': 'belts',
        'scarf': 'scarfs',  // Map scarf to scarfs (plural in database)
        'scarfs': 'scarfs'
      };
      const subcategoryValue = categoryMap[catLower] || catLower;
      const regexPattern = `^${subcategoryValue}$`;
      const regexCount = await Fashion.countDocuments({ subcategory: { $regex: regexPattern, $options: 'i' } });
      const exactCount = await Fashion.countDocuments({ subcategory: subcategoryValue });
      const exactLowerCount = await Fashion.countDocuments({ subcategory: subcategoryValue.toLowerCase() });
      console.log(`📊 Testing subcategory: ${subcategoryValue}`);
      console.log(`📊 Products matching regex "^${subcategoryValue}$": ${regexCount}`);
      console.log(`📊 Products with exact subcategory "${subcategoryValue}": ${exactCount}`);
      console.log(`📊 Products with exact subcategory "${subcategoryValue.toLowerCase()}": ${exactLowerCount}`);
    }
    
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
