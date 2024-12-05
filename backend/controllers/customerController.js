const User = require('../models/userModel');
const Purchase = require('../models/purchaseModel');
const Item = require('../models/itemModel');
const bcrypt = require('bcrypt');
const STRIPE_SECRET_KEY = 'sk_test_51Q1BEGDvKfDjvcpCsEqOVgaKLyoDU660JD41lqYzQU3G9KUsvFmcDiJ72dLMexorHUr4rC91KPBmMeiJxDZlpgru00gDvBILze';
const stripe = require('stripe')(STRIPE_SECRET_KEY);

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
            const { itemId } = req.body;
            const userId = req.session.userId;
            
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
            
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            
            const existingItemIndex = user.cart.findIndex(item => 
                item.item.toString() === itemId.toString()
            );
            
            if (existingItemIndex !== -1) {
                // Safely increment existing item's quantity
                user.cart[existingItemIndex].quantity += 0.5;
            } else {
                // Add new item with quantity 1
                user.cart.push({ item: itemId, quantity: 0.5 });
            }
            
            await user.save();
            res.json({ success: 'Item added to cart successfully' });
        } catch (error) {
            console.error("Checkout error:", error);
            return res.status(500).json({ error: 'Something went wrong during checkout. Please try again.' });
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
    
            console.log("Current cart before deletion:", user.cart);
    
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
            console.log("ENtered")
    
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
            console.log("User cart:", user.cart);
            if (!user) {
                return res.status(400).json({ error: 'User not found' });
            }

            const itemsToPurchase = user.cart.filter(cartItem => cartItem.item);

            if (itemsToPurchase.length === 0) {
                return res.status(400).json({ error: 'Your cart is empty or contains invalid items' });
            }

            for (const cartItem of itemsToPurchase) {
                const item = await Item.findById(cartItem.item._id);
                if (!item || item.quantity < cartItem.quantity || item.quantity <= 0) {
                    return res.status(400).json({ error: `Insufficient quantity for item: ${cartItem.item.name}` });
                }
            }

            const totalAmount = itemsToPurchase.reduce((total, cartItem) => {
                return total + (cartItem.item.pricePerKg * cartItem.quantity * 1.5);
            }, 0);
            console.log("Total amount:", totalAmount);

            let discount = 0;
            if (user.subscription === 'pro') {
                discount = totalAmount * 0.10;
            } else if (user.subscription === 'pro plus') {
                discount = totalAmount * 0.20;
            }

            const finalAmount = totalAmount - discount;
            console.log("Final amount:", finalAmount);

            if (!user.address || !user.address.hno || !user.address.street || !user.address.city || !user.address.state || !user.address.country || !user.address.zipCode) {
                return res.status(400).json({ error: 'Please fill in all the required address fields before checkout.' });
            }
            console.log("Changes Done Payment method is", paymentMethod);
            if (paymentMethod === 'COD') {
                console.log("Payment method is COD");
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

                for (const cartItem of itemsToPurchase) {
                    const item = await Item.findById(cartItem.item._id);
                    if (item) {
                        item.quantity -= cartItem.quantity;
                        if (item.quantity <= 0) {
                            await Item.findByIdAndDelete(item._id);
                        } else {
                            await item.save();
                        }
                    }
                }

                user.cart = [];
                console.log("Checkedout success");
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

                    for (const cartItem of itemsToPurchase) {
                        const item = await Item.findById(cartItem.item._id);
                        if (item) {
                            item.quantity -= cartItem.quantity;
                            if (item.quantity <= 0) {
                                await Item.findByIdAndDelete(item._id);
                            } else {
                                await item.save();
                            }
                        }
                    }

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
