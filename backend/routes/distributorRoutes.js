const express = require('express');
const router = express.Router();
const distributorController = require('../controllers/distributorController');
const authenticateUser = require("../middleware/authMiddleware")

router.get('/',authenticateUser ,distributorController.getDistributorDetails);
router.post('/update-availability', authenticateUser ,distributorController.updateAvailability);
router.post("/update-info",distributorController.updateDistributorInfo)
router.get("/assigned-purchases",distributorController.getAssignedPurchases)
router.post("/update-delivery-status",distributorController.updateDeliveryStatus)


router.post("/rate-distributor", distributorController.rateDistributor);


module.exports = router;
