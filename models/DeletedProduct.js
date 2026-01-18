const mongoose = require('mongoose');

const deletedProductSchema = new mongoose.Schema({
  originalId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  discounted_price: {
    type: Number,
  },
  stars: {
    type: Number,
    default: 0,
  },
  brand_name: {
    type: String,
  },
  material: {
    type: String,
  },
  color: {
    type: String,
  },
  category: {
    type: String,
    required: true,
  },
  subcategory: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    default: 0,
  },
  deletedAt: {
    type: Date,
    default: Date.now,
  },
  deletedBy: {
    type: String,
  },
  originalCollection: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
  collection: 'deleted_products'
});

module.exports = mongoose.model('DeletedProduct', deletedProductSchema);
