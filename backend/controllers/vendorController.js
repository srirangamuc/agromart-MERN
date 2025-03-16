const Item = require('../models/itemModel');
const VendorRating = require('../models/vendorRatingModel');
const Vendor = require('../models/vendorModel');
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const Purchase = require("../models/purchaseModel");
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
            // console.log(vendorId)

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

            // Add or update the product in the Item model
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
 
            // Add the product to the Vendor model
            const vendorItem = new Vendor({
                vendor: vendorId,
                itemName: name,
                quantity,
                pricePerKg,
                quantitySold: 0, // Initially, nothing is sold
                profit: 0, // Profit is zero initially
                timestamp: Date.now(), // Current timestamp
            });
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

            // Fetch products for the specific vendor, sorted by timestamp
            const products = await Vendor.find({ vendor: vendorId }).sort({ timestamp: 1 });

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

            const { username, password ,email,hno, street,
                city,
                state,
                country,
                zipCode} = req.body;
            // console.log( username, password ,email,hno, street,
            //     city,
            //     state,
            //     country,
            //     zipCode)
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
            if(email){
                user.email=email
            }
            
            if(hno){
                user.address.hno=hno

            }
            if(city){
                user.address.city=city
            }
            if(state){
            user.address.state=state}
            if(street){
                user.address.street=street
            }
            if(country){
                user.address.country=country

            }
            
            if(zipCode){
                user.address.zipCode=zipCode
            }

            await user.save();
            res.status(200).json({ message: 'Profile updated successfully' });
        } catch (error) {
            console.error("Profile update error:", error);
            res.status(500).json({ error: "Server error" });
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
    // Helper function to capitalize the first letter of each word
    capitalizeFirstLetter(string) {
        return string.replace(/\b\w/g, char => char.toUpperCase());
    }


    // new Method regarding Vendor Rating.
    // Function to rate vendor
// New Method regarding Vendor Rating.
// Function to rate vendor
async rateVendor(req, res) {
    // console.log("Vendor rating system entered");

    try {
        const { purchaseId, vendorId, rating } = req.body;
        // console.log("Purchase ID:", purchaseId, "Vendor ID:", vendorId, "Rating:", rating);

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        const purchase = await Purchase.findById(purchaseId);
        if (!purchase || purchase.status !== "completed") {
            return res.status(400).json({ message: "You can rate only after purchase is completed" });
        }
         /*
        const purchasedFromVendor = purchase.items.some((item) => item.vendor?.toString() === vendorId.toString());
        if (!purchasedFromVendor) {
            return res.status(400).json({ message: "Vendor not found in this purchase" });
        }*/

        /*const vendor = await Vendor.findById(vendorId);
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }
        let vendor_user=vendor.vendor;
        // console.log("Vendor User:",vendor_user);*/
        // ✅ Initialize vendorRatings if missing
        if (!purchase.vendorRatings) {
            purchase.vendorRatings = [];
        }

        // ✅ Check if rating exists & update
        const existingRatingIndex = purchase.vendorRatings.findIndex((vr) => vr.vendor.toString() === vendorId);
        if (existingRatingIndex !== -1) {
            const oldRating = purchase.vendorRatings[existingRatingIndex].rating;
            // console.log(`Updating existing rating: ${oldRating} → ${rating}`);

            /*// Remove old rating contribution
            vendor.totalRatings -= oldRating;
            vendor.ratingCount -= 1;*/

            // Update the rating in purchase.vendorRatings
            purchase.vendorRatings[existingRatingIndex].rating = rating;
        } else {
            // console.log(`🟢 New rating added: ${rating}`);

            // Add new rating
            purchase.vendorRatings.push({ vendor: vendorId, rating });
        }

        // ✅ Save updated purchase
        await purchase.save();
        // console.log("✅ Purchase rating updated successfully!");
       
        let vendorRating = await VendorRating.findOne({ vendor: vendorId});

        if (!vendorRating) {
            vendorRating = new VendorRating({
                vendor: vendorId,
                ratingCount: 1,
                totalRatings: rating,
                averageRating: rating,
            });
        } else {
            vendorRating.totalRatings += rating;
            vendorRating.ratingCount += 1;
            vendorRating.averageRating = (vendorRating.totalRatings / vendorRating.ratingCount).toFixed(2);
        }

        await vendorRating.save();
        res.json({ message: "Vendor rating submitted successfully.", averageRating: vendorRating.averageRating });
    } catch (error) {
        // console.error("❌ Error in rating vendor:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}


    async  getVendorRating(req, res) {
        try {
            const vendorId  =  req.session.userId;
            // console.log("Vendor ID:", vendorId);
            const vendorRating = await VendorRating.findOne({ vendor: vendorId });
    
            if (!vendorRating) {
                return res.json({ averageRating: 0, ratingCount:0 });;
            }
        //    console.log("Vendor Rating:", vendorRating.averageRating, "Rating Count:", vendorRating.ratingCount,res);
            res.json({ averageRating: vendorRating.averageRating, ratingCount: vendorRating.ratingCount });
        } catch (error) {
            console.error("Error fetching vendor rating:", error);
            res.status(500).json({ message: "Internal server error." });
        }
    }
    
    
}

// Export an instance of VendorController
module.exports = new VendorController();
