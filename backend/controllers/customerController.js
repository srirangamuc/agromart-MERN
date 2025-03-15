const User = require('../models/userModel');
const Purchase = require('../models/purchaseModel');
const Item = require('../models/itemModel');
const bcrypt = require('bcrypt');

const STRIPE_SECRET_KEY = 'sk_test_51Q1BEGDvKfDjvcpCsEqOVgaKLyoDU660JD41lqYzQU3G9KUsvFmcDiJ72dLMexorHUr4rC91KPBmMeiJxDZlpgru00gDvBILze';
const stripe = require('stripe')(STRIPE_SECRET_KEY);
const Vendor = require('../models/vendorModel')
const Distributor = require("../models/distributorModel")
class CustomerController {
    // Get Customer Dashboard
    async getCustomerDashBoard(req, res) {
        try {
            const userId = req.session.userId;

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
            const userId = req.session.userId;
             console.log("Fetched data:", vendorId, itemName, quantity ) ;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
    
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
    
            // Fetch the item separately
            const item = await Item.findOne({ name: itemName });
            console.log("Item:", item);
            if (!item) {
                return res.status(404).json({ error: 'Item not found' });
            }
        var itemId = item._id;
        console.log("Item Id:", itemId);
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
                console.log("Cart Item:", cartItem.toString(), cartItem.item.toString(), cartItem.vendor.toString());
                console.log("Item Id:", itemId.toString());
                console.log("Vendor Id:", vendorId.toString());
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
            const userId = req.session.userId;
    
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
            const userId = req.session.userId;
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
        console.log("Fetched data:", req.body);
    
        try {
            const user = await User.findById(req.session.userId).populate('cart.item');
            if (!user) {
                return res.status(400).json({ error: 'User not found' });
            }
    
            const { address } = user;
            if (!address || !address.hno || !address.street || !address.city || 
                !address.state || !address.country || !address.zipCode) {
                return res.status(400).json({ error: 'Please provide a complete address before checkout.' });
            }
            console.log(address.city)
    
            // ✅ Fetch available distributors from `User`, NOT `Distributor`
            const availableDistributors = await Distributor.find({
                available: true
            }).populate('user'); // Ensure user details are fetched
            
            const filteredDistributors = availableDistributors.filter(dist => dist.user.address.city === address.city);
            
            console.log("✅ Available Distributors in City:", filteredDistributors);
            
            if (!filteredDistributors.length) {
                return res.status(400).json({ error: 'No available distributor in your city' });
            }
            
            // Select a random distributor
            const assignedDistributor = filteredDistributors[
                Math.floor(Math.random() * filteredDistributors.length)
            ];
            
            console.log("✅ Assigned Distributor:", assignedDistributor.user.name);
            
    
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
                return total + (cartItem.item.pricePerKg * cartItem.quantity * 1.5);
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
                    // new one
                    vendorRatings: itemsToPurchase.map(cartItem => ({
                        vendor: cartItem.vendor, // Fetch vendor from cart
                        rating: null // Rating will be added later
                    }))
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
    
                // ✅ Update distributor's total deliveries (MUST BE IN `User`, NOT `Distributor`)
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
            const userId = req.session.userId;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            const { name, password, hno, street, city, state, zipCode, country } = req.body;

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            if (password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(password, salt);
            }

            user.name = name;
            user.address = { hno, street, city, state, zipCode, country };

            await user.save();
            console.log("Profile updated successfully");
            res.json({ success: 'Profile updated successfully' });
        } catch (error) {
            console.error("Update profile error:", error);
            return res.status(500).json({ error: 'Something went wrong. Please try again.' });
        }
    }
    async getProfile(req, res) {
        try {
          const userId = req.session.userId; // Get the userId from the session
      
          if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' }); // Handle unauthenticated users
          }
      
          // Find the user by userId in the database
          const user = await User.findById(userId).select('-password'); // Don't include the password in the response
      
          if (!user) {
            return res.status(404).json({ error: 'User not found' }); // Handle case where user does not exist
          }
      
          // Return the user profile information
          res.json({
            name: user.name,
            email: user.email,
            address: user.address,
          });
        } catch (error) {
          console.error("Get profile error:", error);
          return res.status(500).json({ error: 'Something went wrong. Please try again.' }); // General error handling
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
            const userId = req.session.userId;
    
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
        console.log(plan)
        const userId = req.session.userId;
    
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
                console.log("Choose Pro Plus")
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
        const userId = req.session.userId;
    
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
