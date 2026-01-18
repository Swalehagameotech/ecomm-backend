const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    userEmail: {
        type: String,
        required: true,
        index: true,
    },
    firebaseUID: {
        type: String,
        required: true,
        index: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: { // Contact email for the address/person
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    addressLine: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    zip: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['Home', 'Office', 'Other'],
        default: 'Home',
    },
    isDefault: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Address', addressSchema);
