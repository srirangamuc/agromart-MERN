/*const User = require('../models/userModel');
const Purchase = require('../models/purchaseModel');
const Item = require('../models/itemModel');
const bcrypt = require('bcrypt');
require("dotenv").config()
const upload = require('../middleware/multerConfig');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Vendor = require('../models/vendorModel')
const Distributor = require("../models/distributorModel")
class CustomerController {
    // Get Customer Dashboard
    async getCustomerDashBoard(req, res) {
        try {
            const userId = req.user?.id;

            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            const userWithCart = await User.findById(userId).populate('cart.item');
            const items = await Item.find({ quantity: { $gt: 0 } });

            // Create a unique item list with average prices
            const uniqueItems = {};

            items.forEach(item => {
                if (uniqueItems[item.name]) {
                    uniqueItems[item.name].total += item.pricePerKg;
                    uniqueItems[item.name].count += 1;
                } else {
                    uniqueItems[item.name] = {
                        ...item.toObject(),
                        total: item.pricePerKg,
                        count: 1
                    };
                }
            });

            const displayItems = Object.values(uniqueItems).map(item => ({
                ...item,
                averagePrice: (item.total / item.count).toFixed(2) // Calculate average price
            }));

            res.json({ items: displayItems, user: userWithCart });
        } catch (error) {
            console.error("Checkout error:", error);
            return res.status(500).json({ error: 'Something went wrong during checkout. Please try again.' });
        }
    }
    // new Method

    async getVendorsByItem (req, res) {
        try {
            const { itemName } = req.params;
            const vendors = await Vendor.find({ itemName }).populate('vendor', 'name');
    
            if (!vendors.length) {
                return res.status(404).json({ message: 'No vendors found for this item.' });
            }
    
            const result = vendors.map(vendor => ({
                vendor: vendor.vendor.name,
                timestamp: vendor.timestamp,
                quantity: vendor.quantity,//- vendor.quantitySold,
                pricePerKg: vendor.pricePerKg,
               id: vendor._id
    
            }));
    
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: 'Server error' });
        }
      }

      async addToCart(req, res) {
        try {
            const { vendorId, itemName, quantity } = req.body;
            const userId = req.user?.id;
            //  console.log("Fetched data:", vendorId, itemName, quantity ) ;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
    
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
    
            // Fetch the item separately
            const item = await Item.findOne({ name: itemName });
            // console.log("Item:", item);
            if (!item) {
                return res.status(404).json({ error: 'Item not found' });
            }
        var itemId = item._id;
        // console.log("Item Id:", itemId);
            // Fetch the vendor details
            const vendorItem = await Vendor.findById(vendorId);
            if (!vendorItem) {
                return res.status(404).json({ error: 'Vendor not found' });
            }
    
            // Check if vendor is actually selling the requested item
            if (vendorItem.itemName !== item.name) {
                return res.status(400).json({ error: 'Vendor does not sell this item' });
            }
    
            // Validate stock availability
            if (!quantity || quantity <= 0 || quantity > vendorItem.quantity) {
                return res.status(400).json({ 
                    error: `Invalid quantity. Only ${vendorItem.quantity}kg available from this vendor.` 
                });
            }
    
            // Check if the same vendor-item pair already exists in the cart
           // Check if the same vendor-item pair already exists in the cart
            const existingCartItem = user.cart.find(cartItem => {
                // console.log("Cart Item:", cartItem.toString(), cartItem.item.toString(), cartItem.vendor.toString());
                // console.log("Item Id:", itemId.toString());
                // console.log("Vendor Id:", vendorId.toString());
                // Prevent undefined property access
                if (!cartItem.item || !cartItem.vendor) {
                    console.error("Cart item has undefined fields:", cartItem);
                    return false;
                }

                return (
                    cartItem.item.toString() === itemId.toString() &&
                    cartItem.vendor.toString() === vendorId.toString()
                );
            });

            if (existingCartItem) {
                existingCartItem.quantity += parseFloat(quantity);
            } else {
                user.cart.push({ 
                    vendor: vendorId, 
                    item: itemId, 
                    quantity: parseFloat(quantity),
                    pricePerKg: vendorItem.pricePerKg 
                });
            }
    
            await user.save();
            res.json({ success: 'Item added to cart successfully' });
    
        } catch (error) {
            console.error("Add to cart error:", error);
            return res.status(500).json({ error: 'Something went wrong. Please try again.' });
        }
    }
    async deleteFromCart(req, res) {
        try {
            const { itemId, vendorId } = req.params;
            const userId = req.user?.id;
    
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
    
            if (!itemId || !vendorId) {
                return res.status(400).json({ error: 'Invalid request. Missing itemId or vendorId.' });
            }
    
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
    
            user.cart = user.cart.filter(cartItem =>
                !(cartItem.item.equals(itemId) && cartItem.vendor.equals(vendorId))
            );
    
            await user.save();
            return res.json({ success: 'Item removed from cart successfully' });
    
        } catch (error) {
            console.error("Delete from cart error:", error);
            return res.status(500).json({ error: 'Something went wrong. Please try again.' });
        }
    }



    async getCart(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
    
            const userWithCart = await User.findById(userId)
                .populate({
                    path: 'cart.item',
                    model: 'Item'
                })
                .populate({
                    path: 'cart.vendor',
                    model: 'Vendor',
                    populate: { path: 'vendor', model: 'User', select: 'name' } // Get vendor name
                });
    
            if (!userWithCart) {
                return res.status(404).json({ error: 'User not found' });
            }
            
            // Prepare cart details
            const cartItems = userWithCart.cart.map(cartItem => ({
                vendorName: cartItem.vendor.vendor.name, // Vendor Name
                itemName: cartItem.item.name, // Item Name
                vendorId: cartItem.vendor._id,
                itemId: cartItem.item._id,
                cartQuantity: cartItem.quantity,
                availableStock: cartItem.vendor.quantity, // Remaining stock for this vendor
                pricePerKg: cartItem.pricePerKg,
                totalPrice: cartItem.pricePerKg * cartItem.quantity
            }));
    
            // Calculate total cart value
            const totalCartValue = cartItems.reduce((total, item) => total + item.totalPrice, 0);
    
            res.json({ 
                cartItems, 
                totalCartValue: totalCartValue.toFixed(2)
            });
    
        } catch (error) {
            console.error("Get cart error:", error);
            return res.status(500).json({ error: 'Something went wrong while fetching cart. Please try again.' });
        }
    }
    

    async checkout(req, res) {
        const { paymentMethod } = req.body;
        // console.log("Fetched data:", req.body);
    
        try {
            const user = await User.findById(req.user?.id).populate('cart.item');
            if (!user) {
                return res.status(400).json({ error: 'User not found' });
            }
    
            const { address } = user;
            if (!address || !address.hno || !address.street || !address.city || 
                !address.state || !address.country || !address.zipCode) {
                return res.status(400).json({ error: 'Please provide a complete address before checkout.' });
            }
            // console.log(address.city)
    
            // ✅ Fetch available distributors from `User`, NOT `Distributor`
            const availableDistributors = await Distributor.find({
                available: true
            }).populate('user'); // Ensure user details are fetched
            
            const filteredDistributors = availableDistributors.filter(dist => dist.user.address.city === address.city);
            
            // console.log("✅ Available Distributors in City:", filteredDistributors);
            
            if (!filteredDistributors.length) {
                return res.status(400).json({ error: 'No available distributor in your city' });
            }
            
            // Select a random distributor
            const assignedDistributor = filteredDistributors[
                Math.floor(Math.random() * filteredDistributors.length)
            ];
            
            // console.log("✅ Assigned Distributor:", assignedDistributor.user.name);
            
    
            const itemsToPurchase = user.cart.filter(cartItem => cartItem.item);
            if (itemsToPurchase.length === 0) {
                return res.status(400).json({ error: 'Your cart is empty or contains invalid items' });
            }
    
            // Process each item in cart
            for (const cartItem of itemsToPurchase) {
                const item = await Item.findById(cartItem.item._id);
                if (!item) {
                    return res.status(400).json({ error: `Item not found: ${cartItem.item.name}` });
                }
    
                // Get all vendor entries for this item
                const vendorItems = await Vendor.find({ 
                    itemName: item.name,
                    quantity: { $gt: 0 }
                }).sort({ timestamp: 1 }); // Process oldest entries first
    
                let remainingQuantityNeeded = cartItem.quantity;
                if (vendorItems.length === 0) {
                    return res.status(400).json({ 
                        error: `No vendor inventory available for ${item.name}` 
                    });
                }
    
                // Check if we can fulfill the order
                const totalAvailableQuantity = vendorItems.reduce((sum, vendor) => sum + vendor.quantity, 0);
                if (totalAvailableQuantity < remainingQuantityNeeded) {
                    return res.status(400).json({ 
                        error: `Insufficient quantity available for ${item.name}. Available: ${totalAvailableQuantity}kg` 
                    });
                }
    
                // Allocate quantities from vendors
                cartItem.vendorAllocations = [];
    
                for (const vendorItem of vendorItems) {
                    if (remainingQuantityNeeded <= 0) break;
    
                    const quantityFromThisVendor = Math.min(
                        vendorItem.quantity,
                        remainingQuantityNeeded
                    );
    
                    cartItem.vendorAllocations.push({
                        vendorId: vendorItem.vendor,
                        quantity: quantityFromThisVendor,
                        pricePerKg: vendorItem.pricePerKg
                    });
    
                    remainingQuantityNeeded -= quantityFromThisVendor;
                }
            }
    
            const totalAmount = itemsToPurchase.reduce((total, cartItem) => {
                return total + (cartItem.pricePerKg * cartItem.quantity );//item.//* 1.5
            }, 0);
    
            let discount = 0;
            if (user.subscription === 'pro') {
                discount = totalAmount * 0.10;
            } else if (user.subscription === 'pro plus') {
                discount = totalAmount * 0.20;
            }
    
            const finalAmount = totalAmount - discount;
    
            if (paymentMethod === 'COD') {
                // Create purchase record
// Create a unique vendors map
                        const uniqueVendors = new Map();

                        // Process vendors asynchronously
                        await Promise.all(
                            itemsToPurchase.map(async (cartItem) => {
                                const vendor = await Vendor.findById(cartItem.vendor);
                                
                                if (vendor && !uniqueVendors.has(vendor.vendor.toString())) {
                                    const vendorUser = await User.findById(vendor.vendor); // Get vendor's user details
                                    uniqueVendors.set(vendor.vendor.toString(), {
                                        vendorName: vendorUser?.name || "Unknown Vendor", // Ensure vendor name exists
                                        vendor: vendor.vendor, // Store vendor ID
                                        rating: null // Rating will be added later
                                    });
                                }
                            })
                        );

                        // Convert unique vendors map to an array
                        const vendorRatings = Array.from(uniqueVendors.values());

                        const purchase = new Purchase({
                            user: user._id,
                            items: itemsToPurchase.map(cartItem => ({
                                item: cartItem.item._id,
                                vendor: cartItem.vendor._id,
                                name: cartItem.item.name,
                                quantity: cartItem.quantity,
                                pricePerKg: cartItem.item.pricePerKg
                            })),
                            purchaseDate: new Date(),
                            status: 'received',
                            totalAmount: finalAmount,
                            address: user.address,
                            deliveryStatus: 'assigned',
                            assignedDistributor: assignedDistributor.user._id,
                            // Use unique vendor ratings
                            vendorRatings: vendorRatings
                        });

await purchase.save();

    
                // Update vendor quantities and profits
                for (const cartItem of itemsToPurchase) {
                    for (const allocation of cartItem.vendorAllocations) {
                        const vendorItem = await Vendor.findOne({ 
                            vendor: allocation.vendorId,
                            itemName: cartItem.item.name
                        });
    
                        if (vendorItem) {
                            vendorItem.quantity -= allocation.quantity;
                            vendorItem.quantitySold += allocation.quantity;
                            vendorItem.profit += allocation.quantity * allocation.pricePerKg;
                            await vendorItem.save();
                        }
    
                        // Update main item quantity
                        const item = await Item.findById(cartItem.item._id);
                        if (item) {
                            item.quantity -= allocation.quantity;
                            if (item.quantity <= 0) {
                                await Item.findByIdAndDelete(item._id);
                            } else {
                                await item.save();
                            }
                        }
                    }
                }
    
                // Update distributor's total deliveries 
                await User.findByIdAndUpdate(assignedDistributor.user._id, {
                    $inc: { totalDeliveries: 1 }
                });
    
                user.cart = [];
                await user.save();
                return res.json({ success: 'Order placed successfully' });
    
            } else if (paymentMethod === 'stripe') {
                try {
                    const session = await stripe.checkout.sessions.create({
                        payment_method_types: ['card'],
                        line_items: [{
                            price_data: {
                                currency: 'inr',
                                product_data: { name: 'Total Purchase' },
                                unit_amount: Math.round(finalAmount * 100),
                            },
                            quantity: 1,
                        }],
                        mode: 'payment',
                        success_url: `http://localhost:5173/success`,
                        cancel_url: `http://localhost:5173/cancel`,
                    });
    
                    res.json({ sessionUrl: session.url });
    
                    // Create purchase record
                    const purchase = new Purchase({
                        user: user._id,
                        items: itemsToPurchase.map(cartItem => ({
                            item: cartItem.item._id,
                            vendor: cartItem.vendor._id,
                            name: cartItem.item.name,
                            quantity: cartItem.quantity,
                            pricePerKg: cartItem.item.pricePerKg
                        })),
                        purchaseDate: new Date(),
                        status: 'received',
                        totalAmount: finalAmount,
                        address: user.address,
                        deliveryStatus: 'assigned',
                        assignedDistributor: assignedDistributor.user._id,

                        // ✅ Initialize vendor ratings as empty (to be updated later)
                        vendorRatings: itemsToPurchase.map(cartItem => ({
                            vendor: cartItem.vendor._id,
                            rating: null // Initially empty
                        }))
                    });
                    await purchase.save();
    

                    // new added such that stripe handles the delivery.
                    // Update vendor quantities and profits
                for (const cartItem of itemsToPurchase) {
                    for (const allocation of cartItem.vendorAllocations) {
                        const vendorItem = await Vendor.findOne({ 
                            vendor: allocation.vendorId,
                            itemName: cartItem.item.name
                        });
    
                        if (vendorItem) {
                            vendorItem.quantity -= allocation.quantity;
                            vendorItem.quantitySold += allocation.quantity;
                            vendorItem.profit += allocation.quantity * allocation.pricePerKg;
                            await vendorItem.save();
                        }
    
                        // Update main item quantity
                        const item = await Item.findById(cartItem.item._id);
                        if (item) {
                            item.quantity -= allocation.quantity;
                            if (item.quantity <= 0) {
                                await Item.findByIdAndDelete(item._id);
                            } else {
                                await item.save();
                            }
                        }
                    }
                }
                    await User.findByIdAndUpdate(assignedDistributor.user._id, {
                        $inc: { totalDeliveries: 1 }
                    });
    
                    user.cart = [];
                    await user.save();
                } catch (error) {
                    console.error("Checkout error:", error);
                    return res.status(500).json({ error: 'Something went wrong during checkout. Please try again.' });
                }
            }
        } catch (error) {
            console.error("Checkout error:", error);
            return res.status(500).json({ error: 'Something went wrong during checkout. Please try again.' });
        }
    }
    
    

    async cancel(req, res) {
        res.json({ message: 'Payment canceled' });
    }

    async updateProfile(req, res) {
        try {
            // console.log("📩 Received update-profile request");
    
            const customerId = req.user?.id;
            // console.log("Session userId:", customerId);
            if (!customerId) {
                return res.status(401).json({ error: "Unauthorized - User ID not found in session" });
            }
    
            const customer = await User.findById(customerId);
            if (!customer) {
                return res.status(404).json({ error: "Customer not found" });
            }
    
            // console.log("📝 Raw Request Body:", req.body);
    
            // Extract form data
            const { name, email, hno, street, city, state, zipCode, country } = req.body;
    
            if (name) customer.name = name;
            if (email) customer.email = email;
    
            if (!customer.address) {
                customer.address = {}; // Initialize if null
            }
    
            // Update Address
            customer.address.hno = hno || customer.address.hno;
            customer.address.street = street || customer.address.street;
            customer.address.city = city || customer.address.city;
            customer.address.state = state || customer.address.state;
            customer.address.zipCode = zipCode || customer.address.zipCode;
            customer.address.country = country || customer.address.country;
    
            // console.log("📁 Uploaded file:", req.file);
    
            // Handle profile picture upload
            if (req.file) {
                const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];
                if (!allowedTypes.includes(req.file.mimetype)) {
                    return res.status(400).json({ error: "Invalid file type. Only PNG, JPG, and JPEG are allowed." });
                }
    
                // Update profile picture path
                customer.profilePicture = `/uploads/${req.file.filename}`;
                // console.log(`📸 Uploaded File Path: ${customer.profilePicture}`);
            }
    
            // Save updated customer data
            await customer.save();
    
            res.status(200).json({
                success: true,
                message: "Profile updated successfully",
                user: {
                    name: customer.name,
                    email: customer.email,
                    address: customer.address,
                    profilePicture: customer.profilePicture,
                }
            });
    
        } catch (error) {
            // console.error("❌ Error updating profile:", error);
            res.status(500).json({ error: "Failed to update profile" });
        }
    }
    
    
    
    async getProfile(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
    
            const user = await User.findById(userId).select('-password');
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
    
            res.json({
                name: user.name,
                email: user.email,
                address: user.address,
                profilePicture: user.profilePicture || null
            });
        } catch (error) {
            console.error("Get profile error:", error);
            return res.status(500).json({ error: 'Something went wrong. Please try again.' });
        }
      }
    async logout(req, res) {
        req.session.destroy(err => {
            if (err) {
                return res.status(500).json({ error: 'Failed to logout' });
            }
            res.json({ success: 'Logged out successfully' });
        });
    }
    
    async getPurchases(req, res) {
        try {
            const userId = req.user?.id;
    
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
    
            const purchases = await Purchase.find({ user: userId });
    
            res.json(purchases); // Return JSON response with purchases
        } catch (error) {
            console.error("Purchases error:", error);
            return res.status(500).json({ error: 'Something went wrong. Please try again.' });
        }
    }
    
    async getSuccess(req, res) {
        res.json({ message: 'Payment successful' }); // JSON response instead of rendering success page
    }
    
    async getFailure(req, res) {
        res.json({ message: 'Payment failed' }); // JSON response instead of rendering failure page
    }
    
    async purchaseSubscription(req, res) {
        const { plan } = req.body; // 'pro' or 'pro plus'
        // console.log(plan)
        const userId = req.user?.id;
    
        try {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
    
            let amount;
            if (plan === 'pro') {
                amount = 59900; // ₹599 in paisa
            } else if (plan === 'pro plus') {
                amount = 89900; // ₹899 in paisa
                // console.log("Choose Pro Plus")
            } else {
                return res.status(400).json({ error: 'Invalid plan' });
            }
    
            // Create Stripe checkout session
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: `${plan} subscription`,
                        },
                        unit_amount: amount,
                    },
                    quantity: 1,
                }],
                mode: 'payment',
                success_url: `http://localhost:5173/success`,
                cancel_url: `http://localhost:5173/cancel`,

            });
            user.subscription= plan; // Assuming `subscriptionPlan` is a field in the `User` schema
            await user.save();
            res.json({ sessionUrl: session.url }); // Return session URL for frontend redirection
        } catch (error) {
            console.error("Checkout error:", error);
            return res.status(500).json({ error: 'Something went wrong during checkout. Please try again.' });
        }
    }
    
    async successSubscription(req, res) {
        const { plan } = req.query; // 'pro' or 'pro plus'
        const userId = req.user?.id;
    
        try {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
    
            // Update user's subscription plan
            user.subscription = plan;
            await user.save();
    
            res.json({ success: 'Subscription updated successfully', subscription: plan });
        } catch (error) {
            console.error("Checkout error:", error);
            return res.status(500).json({ error: 'Something went wrong during checkout. Please try again.' });
        }
    }
    
    async cancelPayment(req, res) {
        res.json({ message: 'Payment canceled' }); // Return JSON response instead of rendering cancel page
    }
}

module.exports = new CustomerController();*/

const User = require('../models/userModel');
const Purchase = require('../models/purchaseModel');
const Item = require('../models/itemModel');
const bcrypt = require('bcryptjs');
require("dotenv").config()
const upload = require('../middleware/multerConfig');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Vendor = require('../models/vendorModel')
const Distributor = require("../models/distributorModel")
const redisClient = require('../redis_client'); // Import Redis client
class CustomerController {
 

    // Cache distributors for top 4 cities
    async cacheTopCitiesDistributors() {
        try {
            // Step 1: Find top 4 cities by customer count
            const topCities = await User.aggregate([
                { $match: { role: 'customer', 'address.city': { $ne: null } } },
                { $group: { _id: '$address.city', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 4 },
                { $project: { city: '$_id', _id: 0 } }
            ]);

            const cities = topCities.map(c => c.city.toLowerCase());
            console.log('Top 4 cities:', cities);

            // Step 2: Fetch available distributors for these cities
            const distributorsByCity = {};
            for (const city of cities) {
                const distributors = await Distributor.aggregate([
                    { $match: { available: true } },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'user',
                            foreignField: '_id',
                            as: 'user'
                        }
                    },
                    { $unwind: '$user' },
                    {
                        $match: {
                          $expr: {
                            $eq: [
                              { $toLower: "$user.address.city" },
                              city.toLowerCase()
                            ]
                          }
                        }
                      },
                    {
                        $project: {
                            _id: 1,
                            user: {
                                _id: '$user._id',
                                name: '$user.name',
                                address: '$user.address'
                            }
                        }
                    }
                ]);

                distributorsByCity[city] = distributors;
            }

            // Step 3: Store in Redis
            const cacheKey = 'top_cities_distributors';
            await redisClient.setEx(cacheKey, 3600, JSON.stringify(distributorsByCity)); // Cache for 1 hour
            console.log('Cached distributors for top cities in Redis');

            return distributorsByCity;
        } catch (error) {
            console.error('Error caching distributors:', error);
            throw error;
        }
    }
    async cacheDashboardItems() {
        try {
            // Fetch items from MongoDB
            const items = await Item.find({ quantity: { $gt: 0 } });

            // Create a unique item list with average prices
            const uniqueItems = {};
            items.forEach(item => {
                if (uniqueItems[item.name]) {
                    uniqueItems[item.name].total += item.pricePerKg;
                    uniqueItems[item.name].count += 1;
                } else {
                    uniqueItems[item.name] = {
                        ...item.toObject(),
                        total: item.pricePerKg,
                        count: 1
                    };
                }
            });

            const displayItems = Object.values(uniqueItems).map(item => ({
                ...item,
                averagePrice: (item.total / item.count).toFixed(2)
            }));

            // Cache in Redis
            try {
                const cacheKey = 'dashboard_items';
                await redisClient.setEx(cacheKey, 3600, JSON.stringify(displayItems)); // Cache for 1 hour
                console.log('Cached dashboard items in Redis');
            } catch (redisError) {
                console.error('Failed to cache dashboard items in Redis:', redisError.message);
            }

            return displayItems;
        } catch (error) {
            console.error('Error caching dashboard items:', error);
            throw error;
        }
    }

    // Get Customer Dashboard with Redis caching
    async getCustomerDashBoard(req, res) {
        try {
            const userId = req.user?.id;

            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            const userWithCart = await User.findById(userId).populate('cart.item');

            // Try to get items from Redis
            let displayItems = [];
            const cacheKey = 'dashboard_items';
            try {
                const cachedData = await redisClient.get(cacheKey);
                if (cachedData) {
                    displayItems = JSON.parse(cachedData);
                    console.log('Retrieved dashboard items from Redis');
                }
            } catch (redisError) {
                console.error('Redis error in getCustomerDashBoard:', redisError.message);
            }

            // If cache miss or Redis error, fetch from MongoDB and cache
            if (!displayItems.length) {
                console.log('Cache miss, fetching dashboard items from MongoDB');
                displayItems = await this.cacheDashboardItems();
            }


            res.json({ items: displayItems, user: userWithCart });
        } catch (error) {
            console.error('getCustomerDashBoard error:', error);
            return res.status(500).json({ error: 'Something went wrong while fetching dashboard. Please try again.' });
        }
    }
    // new Method

    async getVendorsByItem (req, res) {
        try {
            const { itemName } = req.params;
           // Without Index (using natural order)
            console.time('Vendor Query - No Index');
            const vendorsNoIndex = await Vendor.find({ itemName }).hint({ $natural: 1 }).populate('vendor', 'name');
            console.timeEnd('Vendor Query - No Index');

            // With Index (MongoDB chooses index if available)
            console.time('Vendor Query - With Index');
            const vendors = await Vendor.find({ itemName }).populate('vendor', 'name');
            console.timeEnd('Vendor Query - With Index');
            if (!vendors.length) {
                return res.status(404).json({ message: 'No vendors found for this item.' });
            }
    
            const result = vendors.map(vendor => ({
                vendor: vendor.vendor.name,
                timestamp: vendor.timestamp,
                quantity: vendor.quantity,//- vendor.quantitySold,
                pricePerKg: vendor.pricePerKg,
               id: vendor._id
    
            }));
    
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: 'Server error' });
        }
      }

      async addToCart(req, res) {
        try {
            const { vendorId, itemName, quantity } = req.body;
            const userId = req.user?.id;
            //  console.log("Fetched data:", vendorId, itemName, quantity ) ;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
    
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
    
            // Fetch the item separately
            const item = await Item.findOne({ name: itemName });
            // console.log("Item:", item);
            if (!item) {
                return res.status(404).json({ error: 'Item not found' });
            }
            var itemId = item._id;
        // console.log("Item Id:", itemId);
            // Fetch the vendor details
            const vendorItem = await Vendor.findById(vendorId);
            if (!vendorItem) {
                return res.status(404).json({ error: 'Vendor not found' });
            }
    
            // Check if vendor is actually selling the requested item
            if (vendorItem.itemName !== item.name) {
                return res.status(400).json({ error: 'Vendor does not sell this item' });
            }
    
            // Validate stock availability
            if (!quantity || quantity <= 0 || quantity > vendorItem.quantity) {
                return res.status(400).json({ 
                    error: `Invalid quantity. Only ${vendorItem.quantity}kg available from this vendor.` 
                });
            }
    
            // Check if the same vendor-item pair already exists in the cart
           // Check if the same vendor-item pair already exists in the cart
            const existingCartItem = user.cart.find(cartItem => {
                // console.log("Cart Item:", cartItem.toString(), cartItem.item.toString(), cartItem.vendor.toString());
                // console.log("Item Id:", itemId.toString());
                // console.log("Vendor Id:", vendorId.toString());
                // Prevent undefined property access
                if (!cartItem.item || !cartItem.vendor) {
                    console.error("Cart item has undefined fields:", cartItem);
                    return false;
                }

                return (
                    cartItem.item.toString() === itemId.toString() &&
                    cartItem.vendor.toString() === vendorId.toString()
                );
            });

            if (existingCartItem) {
                existingCartItem.quantity += parseFloat(quantity);
            } else {
                user.cart.push({ 
                    vendor: vendorId, 
                    item: itemId, 
                    quantity: parseFloat(quantity),
                    pricePerKg: vendorItem.pricePerKg 
                });
            }
    
            await user.save();
            res.json({ success: 'Item added to cart successfully' });
    
        } catch (error) {
            console.error("Add to cart error:", error);
            return res.status(500).json({ error: 'Something went wrong. Please try again.' });
        }
    }
    async deleteFromCart(req, res) {
        try {
            const { itemId, vendorId } = req.params;
            const userId = req.user?.id;
    
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
    
            if (!itemId || !vendorId) {
                return res.status(400).json({ error: 'Invalid request. Missing itemId or vendorId.' });
            }
    
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
    
            user.cart = user.cart.filter(cartItem =>
                !(cartItem.item.equals(itemId) && cartItem.vendor.equals(vendorId))
            );
    
            await user.save();
            return res.json({ success: 'Item removed from cart successfully' });
    
        } catch (error) {
            console.error("Delete from cart error:", error);
            return res.status(500).json({ error: 'Something went wrong. Please try again.' });
        }
    }

    async checkCityIndexUsage(city) {
        
    
        const result = await User.find({ 'address.city': city }).explain('executionStats');
        console.log(JSON.stringify(result, null, 2));
    
    }
    

    async getCart(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
    
            const userWithCart = await User.findById(userId)
                .populate({
                    path: 'cart.item',
                    model: 'Item'
                })
                .populate({
                    path: 'cart.vendor',
                    model: 'Vendor',
                    populate: { path: 'vendor', model: 'User', select: 'name' } // Get vendor name
                });
    
            if (!userWithCart) {
                return res.status(404).json({ error: 'User not found' });
            }
            
            // Prepare cart details
            const cartItems = userWithCart.cart.map(cartItem => ({
                vendorName: cartItem.vendor.vendor.name, // Vendor Name
                itemName: cartItem.item.name, // Item Name
                vendorId: cartItem.vendor._id,
                itemId: cartItem.item._id,
                cartQuantity: cartItem.quantity,
                availableStock: cartItem.vendor.quantity, // Remaining stock for this vendor
                pricePerKg: cartItem.pricePerKg,
                totalPrice: cartItem.pricePerKg * cartItem.quantity
            }));
    
            // Calculate total cart value
            const totalCartValue = cartItems.reduce((total, item) => total + item.totalPrice, 0);
    
            res.json({ 
                cartItems, 
                totalCartValue: totalCartValue.toFixed(2)
            });
    
        } catch (error) {
            console.error("Get cart error:", error);
            return res.status(500).json({ error: 'Something went wrong while fetching cart. Please try again.' });
        }
    }
    

    async checkout(req, res) {
        const { paymentMethod } = req.body;
        // console.log("Fetched data:", req.body);
    
        try {
            const user = await User.findById(req.user?.id).populate('cart.item');
            if (!user) {
                return res.status(400).json({ error: 'User not found' });
            }
            
            const { address } = user;
            if (!address || !address.hno || !address.street || !address.city || 
                !address.state || !address.country || !address.zipCode) {
                return res.status(400).json({ error: 'Please provide a complete address before checkout.' });
            }
            const city = address.city.toLowerCase();

            // Try to get distributors from Redis
            let distributors = [];
            const cacheKey = 'top_cities_distributors';
            const cachedData = await redisClient.get(cacheKey);

            if (cachedData) {
                const distributorsByCity = JSON.parse(cachedData);
                distributors = distributorsByCity[city] || [];
                console.log(`Retrieved ${distributors.length} distributors from Redis for city: ${city}`);
            }
          
            // If no distributors found in cache or city not in cache, fetch from MongoDB
            if (!distributors.length) {
                console.log('Cache miss or city not in top 4, fetching from MongoDB');
                distributors = await Distributor.aggregate([
                    { $match: { available: true } },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'user',
                            foreignField: '_id',
                            as: 'user'
                        }
                    },
                    { $unwind: '$user' },
                    {
                        $match: {
                          $expr: {
                            $eq: [
                              { $toLower: "$user.address.city" },
                              city.toLowerCase()
                            ]
                          }
                        }
                       }
                ]);

                console.log(`Fetched ${distributors.length} distributors from MongoDB for city: ${city}`);
            }

            if (!distributors.length) {
                return res.status(400).json({ error: 'No available distributor in your city' });
            }

            // Select a random distributor
            const assignedDistributor = distributors[Math.floor(Math.random() * distributors.length)];

            console.log('Aggregated distributors:', distributors.length);
           /* console.log('\n=== METHOD 2: MongoDB Aggregation with Index ===');
            console.time('MongoDB Aggregate Time');
            //console.log(address.city)
            const distributors = await Distributor.aggregate([
                { $match: { available: true } },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                { $unwind: '$user' },
                { $match: { 'user.address.city': address.city.toLowerCase() } }
            ])
        
            console.timeEnd('MongoDB Aggregate Time');*/
    

    // Check if index is used in MongoDB plan
  /*  const explain = await User.find({ 'address.city': address.city.toLowerCase() }).explain('executionStats');

    const indexUsed = explain.queryPlanner.winningPlan.inputStage?.stage === 'IXSCAN';

    console.log('\nIndex used on address.city?', indexUsed);
    
    //console.log('Execution stats:', explain.executionStats);
            //console.log('\n=== METHOD 1: JS Filter After Populate ===');
              //console.time('JS Filter Time');
            // ✅ Fetch available distributors from `User`, NOT `Distributor`
            const availableDistributors = await Distributor.find({
                available: true
            }).populate('user'); // Ensure user details are fetched
            
            const filteredDistributors = availableDistributors.filter(dist => dist.user.address.city === address.city);
            //console.timeEnd('JS Filter Time');
             //console.log('Filtered distributors:',filteredDistributors.length);
            // console.log("✅ Available Distributors in City:", filteredDistributors);
            
            if (!filteredDistributors.length) {
                return res.status(400).json({ error: 'No available distributor in your city' });
            }
            
            // Select a random distributor
            const assignedDistributor = filteredDistributors[
                Math.floor(Math.random() * filteredDistributors.length)
            ];*/
            
            // console.log("✅ Assigned Distributor:", assignedDistributor.user.name);
            
    
            const itemsToPurchase = user.cart.filter(cartItem => cartItem.item);
            if (itemsToPurchase.length === 0) {
                return res.status(400).json({ error: 'Your cart is empty or contains invalid items' });
            }
    
            // Process each item in cart
            for (const cartItem of itemsToPurchase) {
                const item = await Item.findById(cartItem.item._id);
                if (!item) {
                    return res.status(400).json({ error: `Item not found: ${cartItem.item.name}` });
                }
    
                // Get all vendor entries for this item
                const vendorItems = await Vendor.find({ 
                    itemName: item.name,
                    quantity: { $gt: 0 }
                }).sort({ timestamp: 1 }); // Process oldest entries first
    
                let remainingQuantityNeeded = cartItem.quantity;
                if (vendorItems.length === 0) {
                    return res.status(400).json({ 
                        error: `No vendor inventory available for ${item.name}` 
                    });
                }
    
                // Check if we can fulfill the order
                const totalAvailableQuantity = vendorItems.reduce((sum, vendor) => sum + vendor.quantity, 0);
                if (totalAvailableQuantity < remainingQuantityNeeded) {
                    return res.status(400).json({ 
                        error: `Insufficient quantity available for ${item.name}. Available: ${totalAvailableQuantity}kg` 
                    });
                }
    
                // Allocate quantities from vendors
                cartItem.vendorAllocations = [];
    
                for (const vendorItem of vendorItems) {
                    if (remainingQuantityNeeded <= 0) break;
    
                    const quantityFromThisVendor = Math.min(
                        vendorItem.quantity,
                        remainingQuantityNeeded
                    );
    
                    cartItem.vendorAllocations.push({
                        vendorId: vendorItem.vendor,
                        quantity: quantityFromThisVendor,
                        pricePerKg: vendorItem.pricePerKg
                    });
    
                    remainingQuantityNeeded -= quantityFromThisVendor;
                }
            }
    
            const totalAmount = itemsToPurchase.reduce((total, cartItem) => {
                return total + (cartItem.pricePerKg * cartItem.quantity );//item.//* 1.5
            }, 0);
    
            let discount = 0;
            if (user.subscription === 'pro') {
                discount = totalAmount * 0.10;
            } else if (user.subscription === 'pro plus') {
                discount = totalAmount * 0.20;
            }
    
            const finalAmount = totalAmount - discount;
    
            if (paymentMethod === 'COD') {
                // Create purchase record
// Create a unique vendors map
                        const uniqueVendors = new Map();

                        // Process vendors asynchronously
                        await Promise.all(
                            itemsToPurchase.map(async (cartItem) => {
                                const vendor = await Vendor.findById(cartItem.vendor);
                                
                                if (vendor && !uniqueVendors.has(vendor.vendor.toString())) {
                                    const vendorUser = await User.findById(vendor.vendor); // Get vendor's user details
                                    uniqueVendors.set(vendor.vendor.toString(), {
                                        vendorName: vendorUser?.name || "Unknown Vendor", // Ensure vendor name exists
                                        vendor: vendor.vendor, // Store vendor ID
                                        rating: null // Rating will be added later
                                    });
                                }
                            })
                        );

                        // Convert unique vendors map to an array
                        const vendorRatings = Array.from(uniqueVendors.values());

                        const purchase = new Purchase({
                            user: user._id,
                            items: itemsToPurchase.map(cartItem => ({
                                item: cartItem.item._id,
                                vendor: cartItem.vendor._id,
                                name: cartItem.item.name,
                                quantity: cartItem.quantity,
                                pricePerKg: cartItem.item.pricePerKg
                            })),
                            purchaseDate: new Date(),
                            status: 'received',
                            totalAmount: finalAmount,
                            address: user.address,
                            deliveryStatus: 'assigned',
                            assignedDistributor: assignedDistributor.user._id,
                            // Use unique vendor ratings
                            vendorRatings: vendorRatings
                        });

await purchase.save();

    
                // Update vendor quantities and profits
                for (const cartItem of itemsToPurchase) {
                    for (const allocation of cartItem.vendorAllocations) {
                        const vendorItem = await Vendor.findOne({ 
                            vendor: allocation.vendorId,
                            itemName: cartItem.item.name
                        });
    
                        if (vendorItem) {
                            vendorItem.quantity -= allocation.quantity;
                            vendorItem.quantitySold += allocation.quantity;
                            vendorItem.profit += allocation.quantity * allocation.pricePerKg;
                            await vendorItem.save();
                        }
    
                        // Update main item quantity
                        const item = await Item.findById(cartItem.item._id);
                        if (item) {
                            item.quantity -= allocation.quantity;
                            if (item.quantity <= 0) {
                                await Item.findByIdAndDelete(item._id);
                            } else {
                                await item.save();
                            }
                        }
                    }
                }
    
                // Update distributor's total deliveries 
                await User.findByIdAndUpdate(assignedDistributor.user._id, {
                    $inc: { totalDeliveries: 1 }
                });
    
                user.cart = [];
                await user.save();
                return res.json({ success: 'Order placed successfully' });
    
            } else if (paymentMethod === 'stripe') {
                try {
                    const session = await stripe.checkout.sessions.create({
                        payment_method_types: ['card'],
                        line_items: [{
                            price_data: {
                                currency: 'inr',
                                product_data: { name: 'Total Purchase' },
                                unit_amount: Math.round(finalAmount * 100),
                            },
                            quantity: 1,
                        }],
                        mode: 'payment',
                        success_url: `https://agromart-mern-frontend.onrender.com/success`,
                        cancel_url: `https://agromart-mern-frontend.onrender.com/cancel`,
                    });
    
                    res.json({ sessionUrl: session.url });
    
                    // Create purchase record
                    const purchase = new Purchase({
                        user: user._id,
                        items: itemsToPurchase.map(cartItem => ({
                            item: cartItem.item._id,
                            vendor: cartItem.vendor._id,
                            name: cartItem.item.name,
                            quantity: cartItem.quantity,
                            pricePerKg: cartItem.item.pricePerKg
                        })),
                        purchaseDate: new Date(),
                        status: 'received',
                        totalAmount: finalAmount,
                        address: user.address,
                        deliveryStatus: 'assigned',
                        assignedDistributor: assignedDistributor.user._id,

                        // ✅ Initialize vendor ratings as empty (to be updated later)
                        vendorRatings: itemsToPurchase.map(cartItem => ({
                            vendor: cartItem.vendor._id,
                            rating: null // Initially empty
                        }))
                    });
                    await purchase.save();
    

                    // new added such that stripe handles the delivery.
                    // Update vendor quantities and profits
                for (const cartItem of itemsToPurchase) {
                    for (const allocation of cartItem.vendorAllocations) {
                        const vendorItem = await Vendor.findOne({ 
                            vendor: allocation.vendorId,
                            itemName: cartItem.item.name
                        });
    
                        if (vendorItem) {
                            vendorItem.quantity -= allocation.quantity;
                            vendorItem.quantitySold += allocation.quantity;
                            vendorItem.profit += allocation.quantity * allocation.pricePerKg;
                            await vendorItem.save();
                        }
    
                        // Update main item quantity
                        const item = await Item.findById(cartItem.item._id);
                        if (item) {
                            item.quantity -= allocation.quantity;
                            if (item.quantity <= 0) {
                                await Item.findByIdAndDelete(item._id);
                            } else {
                                await item.save();
                            }
                        }
                    }
                }
                    await User.findByIdAndUpdate(assignedDistributor.user._id, {
                        $inc: { totalDeliveries: 1 }
                    });
    
                    user.cart = [];
                    await user.save();
                } catch (error) {
                    console.error("Checkout error:", error);
                    return res.status(500).json({ error: 'Something went wrong during checkout. Please try again.' });
                }
            }
        } catch (error) {
            console.error("Checkout error:", error);
            return res.status(500).json({ error: 'Something went wrong during checkout. Please try again.' });
        }
    }
    
    

    async cancel(req, res) {
        res.json({ message: 'Payment canceled' });
    }

    async updateProfile(req, res) {
        try {
            console.log("📩 Received update-profile request");
    
            const customerId = req.user?.id;
            // const customerId = req.user?._id || req.user?.id;

            console.log("Session userId:", customerId);
            if (!customerId) {
                return res.status(401).json({ error: "Unauthorized - User ID not found in session" });
            }
    
            const customer = await User.findById(customerId);
            if (!customer) {
                return res.status(404).json({ error: "Customer not found" });
            }
    
            // console.log("📝 Raw Request Body:", req.body);
    
            // Extract form data
            const { name, email, hno, street, city, state, zipCode, country } = req.body;
    
            if (name) customer.name = name;
            if (email) customer.email = email;
    
            if (!customer.address) {
                customer.address = {}; // Initialize if null
            }
    
            // Update Address
            customer.address.hno = hno || customer.address.hno;
            customer.address.street = street || customer.address.street;
            customer.address.city = city || customer.address.city;
            customer.address.state = state || customer.address.state;
            customer.address.zipCode = zipCode || customer.address.zipCode;
            customer.address.country = country || customer.address.country;
    
            // console.log("📁 Uploaded file:", req.file);
    
            // Handle profile picture upload
            if (req.file) {
                console.log("✅ File uploaded to Cloudinary:", req.file);
            
                const allowedTypes = ["image/png", "image/jpg", "image/jpeg", "image/webp"];
                if (!allowedTypes.includes(req.file.mimetype)) {
                    return res.status(400).json({ error: "Invalid file type. Only PNG, JPG, JPEG, and WEBP are allowed." });
                }
            
                // Use .path (Cloudinary gives the full URL in .path)
                if (req.file.path) {
                    customer.profilePicture = req.file.path;
                } else {
                    return res.status(500).json({ error: "Image upload failed: No Cloudinary URL found." });
                }
            }
            
    
            // Save updated customer data
            await customer.save();
    
            res.status(200).json({
                success: true,
                message: "Profile updated successfully",
                user: {
                    name: customer.name,
                    email: customer.email,
                    address: customer.address,
                    profilePicture: customer.profilePicture,
                }
            });
    
        } catch (error) {
            // console.error("❌ Error updating profile:", error);
            res.status(500).json({ error: "Failed to update profile" });
        }
    }
    
    
    
    async getProfile(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
    
            const user = await User.findById(userId).select('-password');
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
    
            res.json({
                name: user.name,
                email: user.email,
                address: user.address,
                profilePicture: user.profilePicture || null
            });
        } catch (error) {
            console.error("Get profile error:", error);
            return res.status(500).json({ error: 'Something went wrong. Please try again.' });
        }
      }
    async logout(req, res) {
        req.session.destroy(err => {
            if (err) {
                return res.status(500).json({ error: 'Failed to logout' });
            }
            res.json({ success: 'Logged out successfully' });
        });
    }
    
    async getPurchases(req, res) {
        try {
            const userId = req.user?.id;
    
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
            console.time('Without Index - Purchase.user');
            const purchase1 = await Purchase.find({ user: userId }).hint({ $natural: 1 });
            console.timeEnd('Without Index - Purchase.user');

            console.time('With Index - Purchase.user');
            const purchases = await Purchase.find({ user: userId });
            console.timeEnd('With Index - Purchase.user');

    
            res.json(purchases); // Return JSON response with purchases
        } catch (error) {
            console.error("Purchases error:", error);
            return res.status(500).json({ error: 'Something went wrong. Please try again.' });
        }
    }
    
    async getSuccess(req, res) {
        res.json({ message: 'Payment successful' }); // JSON response instead of rendering success page
    }
    
    async getFailure(req, res) {
        res.json({ message: 'Payment failed' }); // JSON response instead of rendering failure page
    }

    async getCurrentSubscription(req,res) {
        try {
            const userId = req.user?.id; // Assuming you're attaching user info in `authMiddleware`
            
            // Example: Fetch from your database, adjust this to match your DB schema
            const user = await Customer.findById(userId);
        
            if (!user) {
              return res.status(404).json({ message: 'User not found' });
            }
        
            return res.json({ tier: user.subscription || 'free' }); // or however you track subscriptions
          } catch (error) {
            console.error('Error fetching current subscription:', error);
            return res.status(500).json({ message: 'Server error' });
          }
    }
    
    async purchaseSubscription(req, res) {
        const { plan } = req.body; // 'pro' or 'pro plus'
        // console.log(plan)
        const userId = req.user?.id;
    
        try {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
    
            let amount;
            if (plan === 'pro') {
                amount = 59900; // ₹599 in paisa
            } else if (plan === 'pro plus') {
                amount = 89900; // ₹899 in paisa
                // console.log("Choose Pro Plus")
            } else {
                return res.status(400).json({ error: 'Invalid plan' });
            }
    
            // Create Stripe checkout session
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: `${plan} subscription`,
                        },
                        unit_amount: amount,
                    },
                    quantity: 1,
                }],
                mode: 'payment',
                success_url: `https://agromart-mern-frontend.onrender.com/success`,
                cancel_url: `https://agromart-mern-frontend.onrender.com/cancel`,

            });
            user.subscription= plan; // Assuming `subscriptionPlan` is a field in the `User` schema
            await user.save();
            res.json({ sessionUrl: session.url }); // Return session URL for frontend redirection
        } catch (error) {
            console.error("Checkout error:", error);
            return res.status(500).json({ error: 'Something went wrong during checkout. Please try again.' });
        }
    }
    
    async successSubscription(req, res) {
        const { plan } = req.query; // 'pro' or 'pro plus'
        const userId = req.user?.id;
    
        try {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
    
            // Update user's subscription plan
            user.subscription = plan;
            await user.save();
    
            res.json({ success: 'Subscription updated successfully', subscription: plan });
        } catch (error) {
            console.error("Checkout error:", error);
            return res.status(500).json({ error: 'Something went wrong during checkout. Please try again.' });
        }
    }
    
    async cancelPayment(req, res) {
        res.json({ message: 'Payment canceled' }); // Return JSON response instead of rendering cancel page
    }
}

module.exports = new CustomerController();

