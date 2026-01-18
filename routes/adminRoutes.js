const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/authMiddleware');

// All admin routes are protected
router.use(authenticate);

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// Products
router.get('/products', adminController.getAllProducts);
router.post('/products', adminController.addProduct);
router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

// Orders
router.get('/orders', adminController.getAllOrders);
router.put('/orders/:id/status', adminController.updateOrderStatus);

// Users
router.get('/users', adminController.getAllUsers);
router.delete('/users/:id', adminController.deleteUser);

// Deleted Products
router.get('/deleted-products', adminController.getDeletedProducts);
router.post('/restore-product/:id', adminController.restoreProduct);

module.exports = router;
