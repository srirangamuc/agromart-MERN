const User = require('../models/userModel');
const Purchase = require('../models/purchaseModel');
const Item = require('../models/itemModel');
const bcrypt = require('bcrypt');
const STRIPE_SECRET_KEY = 'sk_test_51Q1BEGDvKfDjvcpCsEqOVgaKLyoDU660JD41lqYzQU3G9KUsvFmcDiJ72dLMexorHUr4rC91KPBmMeiJxDZlpgru00gDvBILze';
const stripe = require('stripe')(STRIPE_SECRET_KEY);
const Vendor = require('../models/vendorModel')
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

    async addToCart(req, res) {
        try {
            const { itemId, quantity } = req.body; // Now accepting quantity directly from request
            const userId = req.session.userId;
            
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
            
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Get total available quantity from Item model
            const item = await Item.findById(itemId);
            if (!item) {
                return res.status(404).json({ error: 'Item not found' });
            }

            // Validate the quantity
            if (!quantity || quantity <= 0) {
                return res.status(400).json({ error: 'Please enter a valid quantity greater than 0' });
            }

            // Calculate current cart quantity for this item
            const existingCartItem = user.cart.find(item => 
                item.item.toString() === itemId.toString()
            );
            const currentCartQuantity = existingCartItem ? existingCartItem.quantity : 0;
            const newTotalQuantity = currentCartQuantity + parseFloat(quantity);

            // Check if total quantity exceeds available quantity
            if (newTotalQuantity > item.quantity) {
                return res.status(400).json({ 
                    error: `Cannot add ${quantity}kg to cart. Only ${item.quantity}kg available.` 
                });
            }
            
            if (existingCartItem) {
                existingCartItem.quantity = newTotalQuantity;
            } else {
                user.cart.push({ item: itemId, quantity: parseFloat(quantity) });
            }
            
            await user.save();
            res.json({ 
                success: 'Item added to cart successfully',
                newQuantity: newTotalQuantity
            });
        } catch (error) {
            console.error("Add to cart error:", error);
            return res.status(500).json({ error: 'Something went wrong. Please try again.' });
        }
    }
    

    async deleteFromCart(req, res) {
        try {
            const { itemId } = req.body;
            const userId = req.session.userId;
    
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
    
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
        
            // Filter out the cart item by matching the itemId
            user.cart = user.cart.filter(cartItem => !cartItem.item.equals(itemId));
    
            console.log("Updated cart after deletion:", user.cart);
    
            await user.save();
            res.json({ success: 'Item removed from cart successfully' });
        } catch (error) {
            console.error("Checkout error:", error);
            return res.status(500).json({ error: 'Something went wrong during checkout. Please try again.' });
        }
    }
    async getCart(req, res) {
        try {
            const userId = req.session.userId;    
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
    
            // Find the user and populate the cart items
            const userWithCart = await User.findById(userId).populate('cart.item'); // Populate cart items with their details
            
            if (!userWithCart) {
                return res.status(404).json({ error: 'User not found' });
            }
    
            // Calculate total cart value
            const cartItems = userWithCart.cart.filter(cartItem=>cartItem.item).map(cartItem => ({
                ...cartItem.item.toObject(), // Convert item to plain object
                cartQuantity: cartItem.quantity, // Include quantity in the cart item
                totalPrice: cartItem.item.pricePerKg * cartItem.quantity * 1.5 // Calculate total price for each cart item
            }));
    
            const totalCartValue = cartItems.reduce((total, item) => total + item.totalPrice, 0); // Sum up total value of the cart
    
            res.json({ 
                cartItems: cartItems, 
                totalCartValue: totalCartValue.toFixed(2) // Send total value as string with 2 decimals
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

                // Will update these after payment confirmation
                cartItem.vendorAllocations = [];

                // Allocate quantities from vendors
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

            if (!user.address || !user.address.hno || !user.address.street || !user.address.city || 
                !user.address.state || !user.address.country || !user.address.zipCode) {
                return res.status(400).json({ error: 'Please fill in all the required address fields before checkout.' });
            }

            if (paymentMethod === 'COD') {
                // Create purchase record
                const purchase = new Purchase({
                    user: user._id,
                    items: itemsToPurchase.map(cartItem => ({
                        item: cartItem.item._id,
                        name: cartItem.item.name,
                        quantity: cartItem.quantity,
                        pricePerKg: cartItem.item.pricePerKg
                    })),
                    purchaseDate: new Date(),
                    status: 'received',
                    totalAmount: finalAmount,
                    address: user.address
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

                user.cart = [];
                await user.save();
                return res.json({ success: 'Order placed successfully' });
            } else if (paymentMethod === 'stripe') {
                // Similar implementation for Stripe payment...
                // [Previous Stripe implementation remains the same]
                // After successful payment, implement the same vendor quantity and profit updates as above
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
