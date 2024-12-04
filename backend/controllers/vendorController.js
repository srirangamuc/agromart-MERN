const Item = require('../models/itemModel');
const Vendor = require('../models/vendorModel');
const User = require('../models/userModel');
const bcrypt = require('bcrypt');

// Predefined list of allowed fruits and vegetables
const allowedProducts = [
    "Apple", "Banana", "Orange", "Grapes", "Strawberry", "Blueberry", "Watermelon",
    "Pineapple", "Mango", "Peach", "Plum", "Cherry", "Kiwi", "Lemon", "Lime", "Avocado",
    "Carrot", "Broccoli", "Spinach", "Kale", "Tomato", "Cucumber", "Bell Pepper", "Zucchini",
    "Eggplant", "Potato", "Sweet Potato", "Onion", "Garlic", "Radish", "Beetroot"
];

class VendorController {
    // Function to add a new product
    async addProduct(req, res) {
        try {
            let { name, quantity, pricePerKg } = req.body;
            const vendorId = req.session.userId;

            // Convert quantity and pricePerKg to numbers
            quantity = parseInt(quantity, 10);
            pricePerKg = parseFloat(pricePerKg);

            if (!name || isNaN(quantity) || isNaN(pricePerKg) || !vendorId) {
                return res.status(400).json({ error: 'All fields are required and must be valid numbers. Vendor must be logged in.' });
            }

            name = this.capitalizeFirstLetter(name);

            if (!allowedProducts.includes(name)) {
                return res.status(400).json({ error: 'Product is not allowed. Please select from the list of allowed fruits and vegetables.' });
            }

            const existingProduct = await Item.findOne({ name });

            if (existingProduct) {
                const newTotalPrice = (existingProduct.pricePerKg + pricePerKg) / 2;
                existingProduct.pricePerKg = newTotalPrice;
                existingProduct.quantity += quantity;
                await existingProduct.save();
            } else {
                const newItem = new Item({ name, quantity, pricePerKg });
                await newItem.save();
            }

            const profit = quantity * pricePerKg;
            const vendorItem = new Vendor({ vendor: vendorId, itemName: name, quantity, pricePerKg, profit });
            await vendorItem.save();

            res.status(200).json({ message: 'Product added successfully' });
        } catch (error) {
            console.error('Error adding product:', error);
            res.status(500).json({ error: 'Server error' });
        }
    }

    // Function to fetch products for the vendor
    async getProducts(req, res) {
        try {
            const vendorId = req.session.userId;

            if (!vendorId) {
                return res.status(400).json({ error: 'Vendor must be logged in' });
            }

            // Fetch products for the specific vendor
            const products = await Vendor.find({ vendor: vendorId });

            res.status(200).json({ products });
        } catch (error) {
            console.error('Error fetching products:', error);
            res.status(500).json({ error: 'Server error' });
        }
    }

    // Function to fetch the vendor dashboard data
    async getVendorDashboard(req, res) {
        try {
            const vendorId = req.session.userId;

            if (!vendorId) {
                return res.status(400).json({ error: 'Vendor must be logged in' });
            }

            // Fetch products for the specific vendor
            const products = await Vendor.find({ vendor: vendorId });

            // Fetch vendor profile
            const vendorProfile = await User.findById(vendorId);

            // Prepare data for the profit chart
            const productNames = products.map(product => product.itemName);
            const profits = products.map(product => product.profit);

            // Return data as JSON
            res.status(200).json({ products, vendorProfile, productNames, profits });
        } catch (error) {
            console.error('Error fetching vendor dashboard:', error);
            res.status(500).json({ error: 'Server error' });
        }
    }

    // Update profile
    async updateProfile(req, res) {
        try {
            const userId = req.session.userId;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            const { username, password } = req.body;

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            if (username) {
                user.name = username;
            }

            if (password) {
                // Hash the new password before saving
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(password, saltRounds);
                user.password = hashedPassword;
            }

            await user.save();
            res.status(200).json({ message: 'Profile updated successfully' });
        } catch (error) {
            console.error("Profile update error:", error);
            res.status(500).json({ error: "Server error" });
        }
    }

    // Helper function to capitalize the first letter of each word
    capitalizeFirstLetter(string) {
        return string.replace(/\b\w/g, char => char.toUpperCase());
    }
}

// Export an instance of VendorController
module.exports = new VendorController();
