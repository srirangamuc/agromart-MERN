const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticateUser = require('../middleware/authMiddleware');

// Admin dashboard route
router.get('/', (req, res) => adminController.getAdminDashboard(req, res));

// Update purchase status route
router.post('/update-purchase-status',authenticateUser, (req, res) => adminController.updatePurchaseStatus(req, res));
router.get('/customer-analysis',authenticateUser,(req, res) => adminController.getCustomerAnalysis(req, res));
router.get('/purchases-analysis',authenticateUser, (req, res) => adminController.getPurchasesAnalysis(req, res)); // New route
router.get('/rated-unrated',authenticateUser, (req, res) => adminController.getRatedAndUnratedVendors(req, res));
router.get('/users/city-counts',authenticateUser,(req, res) => adminController.getUserCountsByCity(req, res));
router.get('/ratings',authenticateUser, (req, res) => adminController.getRatingsData(req, res));
router.post('/vendor-details',authenticateUser, (req, res) =>adminController.getVendorDetails(req, res));
router.get('/top-item-each-year',authenticateUser,(req, res) =>adminController. getTopItemEachYear(req, res));
router.get('/top-vendor-each-year',authenticateUser,(req, res) =>adminController. getTopVendorEachYear(req, res));
module.exports = router;
