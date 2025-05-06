const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController'); // Assuming CustomerController is the class
const upload = require('../multer-cloudinary'); // Import Multer middleware
const vendorController = require('../controllers/vendorController');
const authenticateUser = require("../middleware/authMiddleware");
const distributorController = require('../controllers/distributorController');


router.post('/rate-vendor', authenticateUser, vendorController.rateVendor);
// Profile Update Route (Supports Image Upload)

router.post('/rate-distributor', authenticateUser, distributorController.rateDistributor);

// Customer dashboard
router.get('/products',authenticateUser,(req, res) => customerController.getCustomerDashBoard(req, res));
router.get('/vendors/:itemName',authenticateUser,(req, res) => customerController.getVendorsByItem(req, res));
router.get('/get-cart',authenticateUser,(req, res) => customerController.getCart(req, res));

// Add item to cart
// router.post('/add-to-cart', (req, res) => customerController.addToCart(req, res));

// Add Item to Cart - Debugging Logs Added
router.post('/add-to-cart',authenticateUser,(req, res) => {customerController.addToCart(req, res);});
// Delete an item from the cart
// router.post('/delete-from-cart', (req, res) => customerController.deleteFromCart(req, res));

router.delete('/delete-from-cart/:itemId/:vendorId',authenticateUser, customerController.deleteFromCart);


// Checkout
router.post('/checkout',authenticateUser, (req, res) => customerController.checkout(req, res));

router.get('/profile',authenticateUser, (req, res) => customerController.getProfile(req, res));






// ⛔ If using Express Router:
router.post(
    '/update-profile',
    authenticateUser,
    upload.single('profilePicture'), // <-- call it directly
    customerController.updateProfile
  );

// Purchases
router.get('/purchases',authenticateUser, (req, res) => customerController.getPurchases(req, res));

// Subscription
router.post('/subscribe',authenticateUser,(req, res) => customerController.purchaseSubscription(req, res));

router.get('/current-subscription', authenticateUser, (req, res) => customerController.getCurrentSubscription(req, res));

// Success Subscription
router.get('/success-subscription',authenticateUser, (req, res) => customerController.successSubscription(req, res));

// Payment Cancellation
router.get('/cancel',authenticateUser, (req, res) => customerController.cancelPayment(req, res));

// Success and Failure Pages (now returning JSON instead of rendering EJS)
router.get('/success',authenticateUser, (req, res) => customerController.getSuccess(req, res)); // Changed to return JSON
router.get('/failure',authenticateUser, (req, res) => customerController.getFailure(req, res)); // Changed to return JSON

// Logout
router.post('/logout', (req, res) => customerController.logout(req, res)); // Changed to return JSON

module.exports = router;
