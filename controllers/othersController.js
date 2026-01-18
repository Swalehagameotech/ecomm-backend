const Others = require('../models/Others');
const mongoose = require('mongoose');

// @route   GET /api/others
// @desc    Get all others products or filter by category/subcategory/search
// @access  Public
exports.getOthers = async (req, res) => {
  try {
    const { category, subcategory, search, limit = 50 } = req.query;
    
    console.log('📊 Collection name:', Others.collection.name);
    const totalCount = await Others.countDocuments({});
    console.log(`📦 Total documents in collection: ${totalCount}`);
    
    let query = { category: 'Other' }; // Always filter by category = "Other"
    
    // Filter by subcategory if provided
    if (subcategory) {
      // Create flexible regex that matches subcategory with optional spaces/underscores
      // e.g., "tote_bag", "tote bag", "totebag" all match
      const escaped = subcategory.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = escaped.replace(/[\s_]/g, '[\\s_]*');
      
      query.subcategory = { 
        $regex: `^${pattern}$`, 
        $options: 'i' 
      };
      
      console.log(`🔍 Filtering by subcategory: ${subcategory} (pattern: ${pattern})`);
    }
    
    // Search in name or description
    if (search) {
      const searchConditions = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
      
      // Combine search with subcategory filter using $and if both exist
      if (subcategory) {
        query.$and = [
          { subcategory: query.subcategory },
          { $or: searchConditions }
        ];
        delete query.subcategory; // Remove direct assignment, use $and instead
      } else {
        query.$or = searchConditions;
      }
      console.log(`🔍 Searching for: ${search}`);
    }
    
    console.log('🔍 Final query:', JSON.stringify(query, null, 2));
    
    const products = await Others.find(query)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    console.log(`✅ Found ${products.length} others products`);
    
    res.json({
      success: true,
      count: products.length,
      totalInCollection: totalCount,
      data: products
    });
  } catch (error) {
    console.error('❌ Error fetching others products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching others products',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @route   GET /api/others/:id
// @desc    Get single others product by ID
// @access  Public
exports.getOthersById = async (req, res) => {
  try {
    const product = await Others.findById(req.params.id);
    
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
    console.error('Error fetching others product:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching others product',
      error: error.message
    });
  }
};

// @route   POST /api/others
// @desc    Create a new others product (for seeding data)
// @access  Public (should be protected in production)
exports.createOthers = async (req, res) => {
  try {
    const product = await Others.create(req.body);
    
    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error creating others product:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating others product',
      error: error.message
    });
  }
};

// @route   POST /api/others/seed
// @desc    Seed random 50 others products
// @access  Public (for development)
exports.seedOthers = async (req, res) => {
  try {
    await Others.deleteMany({});
    
    const subcategories = {
      skincare: ['cleanser', 'moisturizer', 'facewash', 'sunscreen'],
      bags: ['clutch', 'crossbody', 'tote_bag'],
      perfume: ['perfumes'],
      glasses: ['glasses']
    };
    
    const products = [];
    
    const categoryImages = {
      skincare: "https://res.cloudinary.com/dvkxgrcbv/image/upload/v1765279526/95dce7ab-6c31-44dd-bf49-e8cf53d570b6_fkkjbq.avif",
      bags: "https://res.cloudinary.com/dvkxgrcbv/image/upload/v1765367586/acaa40829713501Red_1_csuaqn.jpg",
      glasses: "https://res.cloudinary.com/dvkxgrcbv/image/upload/v1765595039/clsw529_1_u2fezy.jpg",
      perfume: "https://res.cloudinary.com/dvkxgrcbv/image/upload/v1765436687/a24b612d20937da3d12be63e4b011580_jrhjxb.jpg"
    };
    
    // Generate products for each main category
    Object.keys(subcategories).forEach((mainCategory) => {
      subcategories[mainCategory].forEach((subcat) => {
        for (let i = 1; i <= 12; i++) {
          const price = Math.floor(Math.random() * 5000) + 500;
          const discountedPrice = price - Math.floor(Math.random() * 200);
          
          products.push({
            name: `${mainCategory.charAt(0).toUpperCase() + mainCategory.slice(1)} ${subcat.charAt(0).toUpperCase() + subcat.slice(1)} Product ${i}`,
            description: `High quality ${mainCategory} ${subcat} product with premium features and elegant design.`,
            price: price,
            discounted_price: discountedPrice,
            image: categoryImages[mainCategory],
            category: 'Other',
            subcategory: subcat,
            stock: Math.floor(Math.random() * 100) + 10
          });
        }
      });
    });
    
    const createdProducts = await Others.insertMany(products);
    
    res.json({
      success: true,
      message: `Successfully seeded ${createdProducts.length} others products`,
      count: createdProducts.length
    });
  } catch (error) {
    console.error('Error seeding others products:', error);
    res.status(500).json({
      success: false,
      message: 'Error seeding others products',
      error: error.message
    });
  }
};
