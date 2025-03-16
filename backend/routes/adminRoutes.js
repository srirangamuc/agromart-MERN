const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Admin dashboard route
router.get('/', (req, res) => adminController.getAdminDashboard(req, res));

// Update purchase status route
router.post('/update-purchase-status', (req, res) => adminController.updatePurchaseStatus(req, res));
router.get('/customer-analysis', (req, res) => adminController.getCustomerAnalysis(req, res));
router.get('/purchases-analysis', (req, res) => adminController.getPurchasesAnalysis(req, res)); // New route
router.get('/rated-unrated', (req, res) => adminController.getRatedAndUnratedVendors(req, res));
router.get('/users/city-counts',(req, res) => adminController.getUserCountsByCity(req, res));
router.get('/ratings', (req, res) => adminController.getRatingsData(req, res));
router.post('/vendor-details', (req, res) =>adminController.getVendorDetails(req, res));
router.get('/top-item-each-year',(req, res) =>adminController. getTopItemEachYear(req, res));
router.get('/top-vendor-each-year',(req, res) =>adminController. getTopVendorEachYear(req, res));
module.exports = router;
