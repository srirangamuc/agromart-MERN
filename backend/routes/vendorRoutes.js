const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const Vendor = require('../models/vendorModel');
const authenticateUser = require("../middleware/authMiddleware");

// ✅ Profile Routes
router.get('/profile', authenticateUser, vendorController.getProfile);
router.post('/', authenticateUser, vendorController.updateProfile); // Update profile
router.get('/', authenticateUser, vendorController.getVendorDashboard); // Dashboard (alias for /dashboard)

// ✅ Product Routes
router.post('/add-product', authenticateUser, vendorController.addProduct);
router.get('/products', authenticateUser, vendorController.getProducts);

// ✅ Dashboard
router.get('/dashboard', authenticateUser, vendorController.getVendorDashboard);

// ✅ Profit Data Route
router.get('/profit-data', authenticateUser, async (req, res) => {
    try {
        const vendorId = req.user?.id;

        const products = await Vendor.find({ vendor: vendorId });

        const profitDataMap = new Map();

        products.forEach(product => {
            const currentProfit = profitDataMap.get(product.itemName) || 0;
            profitDataMap.set(product.itemName, currentProfit + product.profit);
        });

        const productNames = Array.from(profitDataMap.keys());
        const profits = Array.from(profitDataMap.values());

        res.json({ productNames, profits });
    } catch (error) {
        console.error('Error fetching profit data:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ✅ Vendor Rating
router.post('/rate-vendor', authenticateUser, vendorController.rateVendor);
router.get('/rating', authenticateUser, vendorController.getVendorRating);

module.exports = router;
