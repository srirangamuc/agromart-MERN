const express = require('express');
const router = express.Router();
const distributorController = require('../controllers/distributorController');
const authenticateUser = require("../middleware/authMiddleware")
const upload = require('../middleware/multerConfig');

// router.use((req, res, next) => {
//     console.log(`📢 API REQUEST RECEIVED: ${req.method} ${req.url}`);
//     next();
// });


router.get("/",authenticateUser,distributorController.getDistributorDetails);
router.post('/update-availability', authenticateUser ,distributorController.updateAvailability);

router.post(
    "/update-info",
    authenticateUser,
    upload.single("profilePicture"), // Multer middleware
    (req, res, next) => {
        // Ensure body fields are correctly parsed
        if (req.body.contactPhone) {
            req.body.contactPhone = JSON.parse(req.body.contactPhone);
        }
        if (req.body.address) {
            req.body.address = JSON.parse(req.body.address);
        }
        next();
    },
    distributorController.updateDistributorInfo
);


router.get("/assigned-purchases",authenticateUser,distributorController.getAssignedPurchases)
router.post("/update-delivery-status",authenticateUser,distributorController.updateDeliveryStatus)

// router.post("/rate-distributor",authenticateUser, distributorController.rateDistributor);
router.post("/rate-distributor", authenticateUser, (req, res, next) => {
    console.log("Received rating request:", req.body);
    next();
}, distributorController.rateDistributor);



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

