const Product = require('../models/Product');
const mongoose = require('mongoose');

// @route   GET /api/products
// @desc    Get all products or filter by category/search
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const { category, search, limit = 50 } = req.query;
    
    // Debug: Check collection and total count first
    console.log('📊 Collection name:', Product.collection.name);
    const totalCount = await Product.countDocuments({});
    console.log(`📦 Total documents in collection: ${totalCount}`);
    
    // If no documents at all, try to find what's wrong
    if (totalCount === 0) {
      console.log('⚠️  Collection is empty! Checking database...');
      const db = mongoose.connection.db;
      const collections = await db.listCollections().toArray();
      console.log('📋 Available collections:', collections.map(c => c.name));
      
      // Try to access the collection directly
      for (const col of collections) {
        if (col.name.toLowerCase().includes('accessor') || col.name.toLowerCase().includes('product')) {
          const directCount = await db.collection(col.name).countDocuments();
          console.log(`  - ${col.name}: ${directCount} documents`);
        }
      }
    }
    
    let query = {};
    
    // Filter by subcategory if provided
    // Your data uses: subcategory: "necklaces" (plural)
    // Frontend sends: "necklace" (singular)
    if (category) {
      const categoryMap = {
        'anklet': 'anklets',
        'bracelet': 'bracelets', 
        'necklace': 'necklaces',
        'watch': 'watches'
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
    
    const products = await Product.find(query)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    console.log(`✅ Found ${products.length} products`);
    
    // If no products but collection has data, show sample
    if (products.length === 0 && totalCount > 0) {
      console.log('⚠️  Query returned 0 results, but collection has data. Showing sample...');
      const sample = await Product.findOne({});
      if (sample) {
        console.log('📋 Sample document structure:', {
          name: sample.name,
          category: sample.category,
          subcategory: sample.subcategory,
          price: sample.price
        });
      }
    }
    
    res.json({
      success: true,
      count: products.length,
      totalInCollection: totalCount,
      data: products
    });
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
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

// @route   POST /api/products
// @desc    Create a new product (for seeding data)
// @access  Public (should be protected in production)
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    
    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
};

// @route   POST /api/products/seed
// @desc    Seed random 50 products
// @access  Public (for development)
exports.seedProducts = async (req, res) => {
  try {
    // Clear existing products
    await Product.deleteMany({});
    
    const categories = ['anklet', 'bracelet', 'necklace', 'watch'];
    const products = [];
    
    // Generate 50 random products
    for (let i = 1; i <= 50; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const categoryImages = {
        anklet: "https://res.cloudinary.com/dvkxgrcbv/image/upload/v1765299587/qld6uf5ece70ogsjslet.avif",
        bracelet: "https://res.cloudinary.com/dvkxgrcbv/image/upload/v1765364822/photo-1752659659278-17c9541e2f77_viftu8.jpg",
        necklace: "https://res.cloudinary.com/dvkxgrcbv/image/upload/v1765363256/photo-1594843310570-1c82e9244e20_mx2dag.jpg",
        watch: "https://res.cloudinary.com/dvkxgrcbv/image/upload/v1765216232/unnamed_tfeles.jpg"
      };
      
      products.push({
        name: `${category.charAt(0).toUpperCase() + category.slice(1)} Product ${i}`,
        description: `Beautiful ${category} with elegant design. Perfect for any occasion. High quality materials and craftsmanship.`,
        price: Math.floor(Math.random() * 5000) + 500, // Random price between 500-5500
        image: categoryImages[category],
        category: 'accessories',
        subcategory: category + 's', // anklets, bracelets, necklaces, watches
        stock: Math.floor(Math.random() * 100) + 10
      });
    }
    
    const createdProducts = await Product.insertMany(products);
    
    res.json({
      success: true,
      message: `Successfully seeded ${createdProducts.length} products`,
      count: createdProducts.length
    });
  } catch (error) {
    console.error('Error seeding products:', error);
    res.status(500).json({
      success: false,
      message: 'Error seeding products',
      error: error.message
    });
  }
};
