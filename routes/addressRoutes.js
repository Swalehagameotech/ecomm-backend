const express = require('express');
const router = express.Router();
const Address = require('../models/Address');

// Add a new address
router.post('/add', async (req, res) => {
    try {
        const { userEmail, firebaseUID, name, email, phone, addressLine, city, state, zip, type, isDefault } = req.body;

        // If setting as default, unset other defaults for this user
        if (isDefault) {
            await Address.updateMany({ userEmail }, { isDefault: false });
        }

        const newAddress = new Address({
            userEmail,
            firebaseUID,
            name,
            email,
            phone,
            addressLine,
            city,
            state,
            zip,
            type,
            isDefault
        });

        const savedAddress = await newAddress.save();
        res.status(201).json(savedAddress);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all addresses for a user
router.get('/:email', async (req, res) => {
    try {
        const addresses = await Address.find({ userEmail: req.params.email }).sort({ isDefault: -1, createdAt: -1 });
        res.json(addresses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
