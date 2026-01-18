const User = require('../models/User');
const Order = require('../models/Order');
const DeletedProduct = require('../models/DeletedProduct');
const NewArrival = require('../models/NewArrival');
const Trending = require('../models/Trending');
const Discount = require('../models/Discount');
const Fashion = require('../models/Fashion');
const Footwear = require('../models/Footwear');
const Others = require('../models/Others');

// Collection mapping
const collectionMap = {
  newarrival: NewArrival,
  trending: Trending,
  discount: Discount,
  fashion: Fashion,
  footwear: Footwear,
  others: Others,
  accessories: Others, // Assuming accessories uses Others collection
};

// Get dashboard statistics
exports.getDashboard = async (req, res) => {
  try {
    const collections = [NewArrival, Trending, Discount, Fashion, Footwear, Others];

    // Get total stock from all collections
    let totalStock = 0;
    const categoryStock = [];

    for (const collection of collections) {
      const products = await collection.find({});
      const stock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
      totalStock += stock;

      const collectionName = collection.modelName.toLowerCase();
      categoryStock.push({
        category: collectionName === 'newarrival' ? 'newarrival' :
          collectionName === 'discount' ? 'discount' :
            collectionName === 'trending' ? 'trending' :
              collectionName,
        stock: stock,
      });
    }

    // Get total customers
    const totalCustomers = await User.countDocuments();

    // Get pending orders (placed, confirmed, shipped are all considered pending)
    const pendingOrders = await Order.countDocuments({ 
      status: { $in: ['placed', 'confirmed', 'shipped'] } 
    });
    const totalOrders = await Order.countDocuments();

    res.json({
      success: true,
      data: {
        totalStock,
        totalCustomers,
        pendingOrders,
        totalOrders,
        categoryStock,
      },
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Get all products from all collections
exports.getAllProducts = async (req, res) => {
  try {
    const allProducts = [];
    const collections = [
      { name: 'newarrival', model: NewArrival },
      { name: 'trending', model: Trending },
      { name: 'discount', model: Discount },
      { name: 'fashion', model: Fashion },
      { name: 'footwear', model: Footwear },
      { name: 'others', model: Others },
    ];

    for (const { name, model } of collections) {
      const products = await model.find({});
      const productsWithCategory = products.map((p) => ({
        ...p.toObject(),
        category: name,
      }));
      allProducts.push(...productsWithCategory);
    }

    res.json({
      success: true,
      data: allProducts,
    });
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Add new product
exports.addProduct = async (req, res) => {
  try {
    const { category, ...productData } = req.body;

    if (!category || !collectionMap[category]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category',
      });
    }

    const ProductModel = collectionMap[category];
    const product = await ProductModel.create(productData);

    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      data: product,
    });
  } catch (error) {
    console.error('Add product error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, ...updateData } = req.body;

    if (!category || !collectionMap[category]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category',
      });
    }

    const ProductModel = collectionMap[category];
    const product = await ProductModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { category } = req.body;

    if (!category || !collectionMap[category]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category',
      });
    }

    const ProductModel = collectionMap[category];
    const product = await ProductModel.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Save to deleted products collection
    const deletedProductData = {
      originalId: product._id.toString(),
      name: product.name,
      image: product.image,
      description: product.description,
      price: product.price,
      discounted_price: product.discounted_price,
      stars: product.stars,
      brand_name: product.brand_name,
      material: product.material,
      color: product.color,
      category: category,
      subcategory: product.subcategory,
      stock: product.stock,
      deletedBy: req.user?.email || 'admin',
      originalCollection: category,
    };

    await DeletedProduct.create(deletedProductData);

    // Delete from original collection
    await ProductModel.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });

    // Enrich orders with user email
    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const user = await User.findOne({ firebaseUID: order.firebaseUID });
        return {
          ...order.toObject(),
          userEmail: user?.email || 'N/A',
        };
      })
    );

    res.json({
      success: true,
      data: enrichedOrders,
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['placed', 'confirmed', 'shipped', 'delivered'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "placed", "confirmed", "shipped", or "delivered"',
      });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order,
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });

    // Enrich users with order count
    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        const orderCount = await Order.countDocuments({ firebaseUID: user.firebaseUID });
        return {
          ...user.toObject(),
          orderCount,
        };
      })
    );

    res.json({
      success: true,
      data: enrichedUsers,
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete all user orders
    const user = await User.findById(id);
    if (user && user.firebaseUID) {
      await Order.deleteMany({ firebaseUID: user.firebaseUID });
    }

    // Delete user
    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Get deleted products
exports.getDeletedProducts = async (req, res) => {
  try {
    const deletedProducts = await DeletedProduct.find({}).sort({ deletedAt: -1 });

    res.json({
      success: true,
      data: deletedProducts,
    });
  } catch (error) {
    console.error('Get deleted products error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Restore deleted product
exports.restoreProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProduct = await DeletedProduct.findById(id);

    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Deleted product not found',
      });
    }

    const { originalCollection, ...productData } = deletedProduct.toObject();
    delete productData.originalId;
    delete productData.deletedAt;
    delete productData.deletedBy;
    delete productData.originalCollection;
    delete productData._id;
    delete productData.createdAt;
    delete productData.updatedAt;

    if (!collectionMap[originalCollection]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid original collection',
      });
    }

    const ProductModel = collectionMap[originalCollection];
    await ProductModel.create(productData);

    // Remove from deleted products
    await DeletedProduct.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Product restored successfully',
    });
  } catch (error) {
    console.error('Restore product error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
