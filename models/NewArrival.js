const mongoose = require('mongoose');

const newArrivalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    required: true
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
  stars: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
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
  category: {
    type: String,
    required: true
  },
  subcategory: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    default: 50,
    min: 0
  }
}, {
  timestamps: true,
  collection: 'newarrival'
});

module.exports = mongoose.model('newarrival', newArrivalSchema);
