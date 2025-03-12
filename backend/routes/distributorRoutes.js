const express = require('express');
const router = express.Router();
const distributorController = require('../controllers/distributorController');
const authenticateUser = require("../middleware/authMiddleware")

router.use((req, res, next) => {
    console.log(`📢 API REQUEST RECEIVED: ${req.method} ${req.url}`);
    next();
});


router.get("/",authenticateUser,distributorController.getDistributorDetails);
router.post('/update-availability', authenticateUser ,distributorController.updateAvailability);
router.post("/update-info",authenticateUser,distributorController.updateDistributorInfo)
router.get("/assigned-purchases",authenticateUser,distributorController.getAssignedPurchases)
router.post("/update-delivery-status",authenticateUser,distributorController.updateDeliveryStatus)

router.post("/rate-distributor",authenticateUser, distributorController.rateDistributor);


module.exports = router;
// const express = require("express");
// const router = express.Router();
// const distributorController = require("../controllers/distributorController");
// const authenticateUser = require("../middleware/authMiddleware");

// // ✅ Debug Middleware to Log Every Request
// router.use((req, res, next) => {
//     console.log(`📢 API HIT: ${req.method} ${req.url}`);
//     next();
// });

// // ✅ Test Route (Check If API is Reachable)
// router.get("/test", (req, res) => {
//     res.status(200).json({ message: "✅ Distributor API is working!" });
// });

// // ✅ Actual Distributor Route
// router.get("/",  distributorController.getDistributorDetails);

// module.exports = router;

