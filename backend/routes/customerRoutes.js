const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController'); // Assuming CustomerController is the class
const upload = require('../middleware/multerConfig'); // Import Multer middleware

// Profile Update Route (Supports Image Upload)



// Customer dashboard
router.get('/products', (req, res) => customerController.getCustomerDashBoard(req, res));
router.get('/vendors/:itemName',(req, res) => customerController.getVendorsByItem(req, res));
router.get('/get-cart', (req, res) => customerController.getCart(req, res));

// Add item to cart
// router.post('/add-to-cart', (req, res) => customerController.addToCart(req, res));

// Add Item to Cart - Debugging Logs Added
router.post('/add-to-cart', (req, res) => {
    // console.log("POST /add-to-cart Request Body:", req.body);
    customerController.addToCart(req, res);
});
// Delete an item from the cart
// router.post('/delete-from-cart', (req, res) => customerController.deleteFromCart(req, res));

router.delete('/delete-from-cart/:itemId/:vendorId', customerController.deleteFromCart);


// Checkout
router.post('/checkout', (req, res) => customerController.checkout(req, res));

router.get('/profile', (req, res) => customerController.getProfile(req, res));






// ⛔ If using Express Router:
router.post('/update-profile', upload.single('profilePicture'), (req, res) => {
    customerController.updateProfile(req, res);
});



// Purchases
router.get('/purchases', (req, res) => customerController.getPurchases(req, res));

// Subscription
router.post('/subscribe', (req, res) => customerController.purchaseSubscription(req, res));

// Success Subscription
router.get('/success-subscription', (req, res) => customerController.successSubscription(req, res));

// Payment Cancellation
router.get('/cancel', (req, res) => customerController.cancelPayment(req, res));

// Success and Failure Pages (now returning JSON instead of rendering EJS)
router.get('/success', (req, res) => customerController.getSuccess(req, res)); // Changed to return JSON
router.get('/failure', (req, res) => customerController.getFailure(req, res)); // Changed to return JSON

// Logout
router.post('/logout', (req, res) => customerController.logout(req, res)); // Changed to return JSON

module.exports = router;
