const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: false,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
  },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  firebaseUID: {
    type: String,
    required: true,
    index: true,
  },
  products: {
    type: [productSchema],
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['placed', 'confirmed', 'shipped', 'delivered'],
    default: 'placed',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Order', orderSchema);
