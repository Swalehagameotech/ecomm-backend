const mongoose = require('mongoose');

const othersSchema = new mongoose.Schema({
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
  stock: {
    type: Number,
    default: 50,
    min: 0
  },
  image: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  subcategory: {
    type: String,
    required: true,
    lowercase: true
  }
}, {
  timestamps: true,
  collection: 'others' // Explicitly set collection name
});

module.exports = mongoose.model('others', othersSchema);
