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
    
    let query = {}; // Start with empty query
    
    // Filter by category if provided (parent categories like "skincare", "bags")
    // This happens when user clicks on main category and wants to see all products from that category
    if (category && !subcategory) {
      const categoryLower = category.toLowerCase().trim();
      if (categoryLower === 'skincare') {
        // Show all skincare products (all child subcategories)
        query.subcategory = { $in: ['cleanser', 'moisturizer', 'facewash', 'sunscreen'] };
        console.log(`🔍 Filtering by category "skincare" - showing all skincare products`);
      } else if (categoryLower === 'bags') {
        // Show all bag products (all child subcategories) - handle both spellings
        query.subcategory = { $in: ['cluthe', 'clutch', 'crossbody', 'tote_bag', 'tote bag'] };
        console.log(`🔍 Filtering by category "bags" - showing all bag products`);
      }
    }
    
    // Filter by subcategory if provided (this takes priority over category)
    if (subcategory) {
      const subcategoryLower = subcategory.toLowerCase().trim();
      
      // Handle parent categories that have multiple child subcategories
      if (subcategoryLower === 'skincare') {
        // Skincare - show only cleanser products
        query.subcategory = 'cleanser';
        console.log(`🔍 Filtering by skincare subcategory: cleanser`);
      } else if (subcategoryLower === 'bags') {
        // Bags - show only crossbody products (when bags is clicked directly from menu)
        query.subcategory = 'crossbody';
        console.log(`🔍 Filtering by bag subcategory: crossbody`);
      } else if (['clutch', 'cluthe', 'crossbody', 'tote_bag', 'tote bag'].includes(subcategoryLower)) {
        // Direct bag subcategory clicked (clutch, cluthe, crossbody, tote_bag, tote bag)
        // Try "cluthe" first (as it might be the actual value in DB), then fallback to "clutch"
        if (subcategoryLower === 'clutch' || subcategoryLower === 'cluthe') {
          // Check which spelling exists in database
          const clutheCount = await Others.countDocuments({ subcategory: 'cluthe' });
          const clutchCount = await Others.countDocuments({ subcategory: 'clutch' });
          console.log(`📊 Products with subcategory "cluthe": ${clutheCount}`);
          console.log(`📊 Products with subcategory "clutch": ${clutchCount}`);
          
          // Use whichever has products, or prefer "cluthe" if both exist
          if (clutheCount > 0) {
            query.subcategory = 'cluthe';
            console.log(`🔍 Using subcategory: cluthe`);
          } else if (clutchCount > 0) {
            query.subcategory = 'clutch';
            console.log(`🔍 Using subcategory: clutch`);
          } else {
            // Default to "cluthe" if neither found (might be new data)
            query.subcategory = 'cluthe';
            console.log(`🔍 Defaulting to subcategory: cluthe`);
          }
        } else {
          query.subcategory = subcategoryLower.toLowerCase();
          console.log(`🔍 Filtering by bag subcategory: ${subcategoryLower}`);
        }
      } else if (['cleanser', 'moisturizer', 'facewash', 'sunscreen'].includes(subcategoryLower)) {
        // Direct skincare subcategory clicked
        query.subcategory = subcategoryLower;
        console.log(`🔍 Filtering by skincare subcategory: ${subcategoryLower}`);
      } else {
        // Handle other direct subcategory matches
        // Database has "perfume" (singular), not "perfumes"
        const subcategoryMap = {
          'perfume': 'perfume',  // Database has "perfume" (singular)
          'perfumes': 'perfume', // Map plural input to singular database value
          'glasses': 'glasses'
        };
        const mappedSubcategory = subcategoryMap[subcategoryLower] || subcategoryLower;
        
        // Use exact match (case-insensitive) for the mapped subcategory
        query.subcategory = { $regex: `^${mappedSubcategory}$`, $options: 'i' };
        console.log(`🔍 Filtering by subcategory: "${subcategoryLower}" → database value: "${mappedSubcategory}"`);
        console.log(`🔍 Regex pattern: ^${mappedSubcategory}$`);
      }
    }
    
    // Only add category filter if no subcategory filter exists, or add it separately
    // Some products might not have category='Other', so let's not force it
    if (!subcategory && category !== 'Other') {
      // Only filter by category if explicitly provided and it's not 'Other'
      // Most queries should work without this filter
    }
    
    // Search in name or description
    if (search) {
      const searchConditions = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
      
      // Combine search with subcategory filter using $and if both exist
      if (query.subcategory) {
        const subcategoryFilter = query.subcategory;
        delete query.subcategory; // Remove from root level
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
    const uniqueSubcategories = await Others.distinct('subcategory');
    console.log(`📋 All unique subcategories in database:`, uniqueSubcategories);
    
    // Debug: Check count for different bag subcategories
    if (subcategory && subcategory.toLowerCase().trim() === 'bags') {
      const bagSubcategories = ['crossbody', 'clutch', 'tote_bag', 'tote bag'];
      for (const bagSub of bagSubcategories) {
        const count = await Others.countDocuments({ subcategory: bagSub });
        console.log(`📊 Products with subcategory "${bagSub}": ${count}`);
      }
    }
    
    // Check count with just subcategory filter for debugging
    if (subcategory && !search) {
      const subcategoryOnlyQuery = {};
      if (subcategory.toLowerCase().trim() === 'skincare') {
        subcategoryOnlyQuery.subcategory = 'cleanser';
      } else if (subcategory.toLowerCase().trim() === 'bags') {
        subcategoryOnlyQuery.subcategory = 'crossbody';
      }
      if (subcategoryOnlyQuery.subcategory) {
        const countWithFilter = await Others.countDocuments(subcategoryOnlyQuery);
        console.log(`📊 Products matching subcategory "${subcategoryOnlyQuery.subcategory}" only: ${countWithFilter}`);
        
        // Also try without category filter
        const countWithoutCategory = await Others.countDocuments({ subcategory: subcategoryOnlyQuery.subcategory });
        console.log(`📊 Products matching subcategory "${subcategoryOnlyQuery.subcategory}" (no category filter): ${countWithoutCategory}`);
      }
    }
    
    const products = await Others.find(query)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    console.log(`✅ Found ${products.length} others products`);
    if (products.length > 0) {
      console.log(`📋 Sample product subcategories:`, products.slice(0, 5).map(p => p.subcategory));
    } else {
      console.log(`⚠️ No products found with query:`, JSON.stringify(query, null, 2));
    }
    
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
