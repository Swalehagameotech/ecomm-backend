const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  discounted_price: {
    type: Number,
    min: 0
  },
  image: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    lowercase: true
  },
  subcategory: {
    type: String,
    required: true,
    lowercase: true
  },
  stock: {
    type: Number,
    default: 50,
    min: 0
  },
  brand_name: {
    type: String
  },
  material: {
    type: String
  },
  color: {
    type: String
  },
  stars: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  }
}, {
  timestamps: true,
  collection: 'accessories' // Explicitly set collection name
});

// Try different possible collection names
// Common variations: 'accessories', 'Accesories', 'accesories', 'Accessories'
module.exports = mongoose.model('accessories', productSchema);
