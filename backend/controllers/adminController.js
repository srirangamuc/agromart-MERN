const Purchase = require('../models/purchaseModel');
const User = require('../models/userModel');
const Item = require('../models/itemModel'); // Import the Item model
const VendorRating = require('../models/vendorRatingModel');
const Distributor = require("../models/distributorModel");
const Vendor = require('../models/vendorModel');
class AdminController {
    async getAdminDashboard(req, res) {
        try {
            // Fetch purchases
            const purchases = await Purchase.find().populate('user').exec();
             
            // Fetch customers grouped by subscription
            const proPlusCustomers = await User.find({ role: 'customer', subscription: 'pro plus' }).sort({ createdAt: -1 });
            const proCustomers = await User.find({ role: 'customer', subscription: 'pro' }).sort({ createdAt: -1 });
            const normalCustomers = await User.find({ role: 'customer', subscription: 'normal' }).sort({ createdAt: -1 });

            // Fetch vendors
            const vendors = await User.find({ role: 'vendor' }).sort({ createdAt: -1 });

            // Send all data as JSON
            res.json({
                purchases,
                proPlusCustomers,
                proCustomers,
                normalCustomers,
                vendors,
            });
        } catch (error) {
            console.error('Error fetching admin dashboard data:', error);
            res.status(500).json({ error: 'Error fetching admin dashboard data' });
        }
    }
    async getRatingsData(req, res) {
        try {
            // Fetch vendor ratings
            const vendors = await VendorRating.find();
            const vendorRatings = { '0-1': 0, '1-2': 0, '2-3': 0, '3-4': 0, '4-5': 0 };
            let vendorTotalRating = 0, vendorCount = 0;

            vendors.forEach(vendor => {
                vendorTotalRating += vendor.averageRating;
                vendorCount++;
                const avg = vendor.averageRating;
                if (avg < 1) vendorRatings['0-1']++;
                else if (avg < 2) vendorRatings['1-2']++;
                else if (avg < 3) vendorRatings['2-3']++;
                else if (avg < 4) vendorRatings['3-4']++;
                else vendorRatings['4-5']++;
            });

            // Fetch delivery guy ratings
            const deliveryGuys = await Distributor.find();
            const deliveryRatings = { '0-1': 0, '1-2': 0, '2-3': 0, '3-4': 0, '4-5': 0 };
            let deliveryTotalRating = 0, deliveryCount = 0;

            deliveryGuys.forEach(delivery => {
                // console.log(delivery.averageRating)
                if(delivery.totalDeliveries){
                deliveryTotalRating += delivery.averageRating;
                deliveryCount++;
                const avg = delivery.averageRating;
                if (avg <= 1) deliveryRatings['0-1']++;
                else if (avg <=2) deliveryRatings['1-2']++;
                else if (avg <=3) deliveryRatings['2-3']++;
                else if (avg <=4) deliveryRatings['3-4']++;
                else deliveryRatings['4-5']++;}
            });
        //    console.log(vendorRatings,deliveryRatings)
            res.json({
                vendorRatings,
                vendorAvg: vendorCount ? (vendorTotalRating / vendorCount).toFixed(2) : "N/A",
                deliveryRatings,
                deliveryAvg: deliveryCount ? (deliveryTotalRating / deliveryCount).toFixed(2) : "N/A"
            });
        } catch (error) {
            console.error("Error fetching rating data:", error);
            res.status(500).json({ error: "Server error" });
        }
    }
    async getRatedAndUnratedVendors(req, res) {
        try {
            const vendors = await User.find({ role: 'vendor' });
            const ratedVendors = [];
            const unratedVendors = [];

            for (const vendor of vendors) {
                const rating = await VendorRating.findOne({ vendor: vendor._id });
                if (rating) {
                    ratedVendors.push({ name: vendor.name, id: vendor._id });
                } else {
                    unratedVendors.push({ name: vendor.name, id: vendor._id });
                }
            }

            res.json({ ratedVendors, unratedVendors });
        } catch (error) {
            console.error("Error fetching rated and unrated vendors:", error);
            res.status(500).json({ error: "Server error" });
        }
    }

    // Get vendor details
    async getVendorDetails(req, res) {
        try {
            const { vendorId } = req.body; // Get vendorId from request body
            const vendor = await User.findById(vendorId);

            if (!vendor || vendor.role !== 'vendor') {
                return res.status(404).json({ error: "Vendor not found" });
            }

            const rating = await VendorRating.findOne({ vendor: vendorId });
            const vendorDetails = {
                id: vendor._id,
                name: vendor.name,
                rating: rating ? rating.averageRating : 0,
                numberOfRatings: rating ? rating.ratingCount : 0
            };

            const vendorStock = await Vendor.find({ vendor: vendorId })
                .select('itemName quantity');

            const vendorProfit = await Vendor.find({ vendor: vendorId })
                .select('itemName quantitySold pricePerKg')
                .lean();

            vendorProfit.forEach(item => {
                item.totalProfit = item.quantitySold * item.pricePerKg;
            });
            // console.log(vendorDetails, vendorStock, vendorProfit)
            res.json({ vendorDetails, vendorStock, vendorProfit });
        } catch (error) {
            console.error("Error fetching vendor details:", error);
            res.status(500).json({ error: "Server error" });
        }
    }
    async getTopItemEachYear(req, res) {
        try {
            const result = await Vendor.aggregate([
                {
                    $group: {
                        _id: { year: { $year: "$timestamp" }, itemName: "$itemName" },
                        totalSold: { $sum: "$quantitySold" }
                    }
                },
                {
                    $match: { "_id.year": { $ne: null } } // Ensure year is valid
                },
                {
                    $sort: { "_id.year": 1, "totalSold": -1 }
                },
                {
                    $group: {
                        _id: "$_id.year",
                        topItem: { $first: "$_id.itemName" },
                        totalSold: { $first: "$totalSold" }
                    }
                },
                {
                    $project: {
                        year: "$_id", // Rename _id to year
                        topItem: 1,
                        totalSold: 1,
                        _id: 0 // Remove _id
                    }
                }
            ]);
    
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    
    
    
    async getTopVendorEachYear(req, res) {
    try {
        const result = await Vendor.aggregate([
            {
                $group: {
                    _id: { year: { $year: "$timestamp" }, vendor: "$vendor" },
                    totalProfit: { $sum: { $multiply: ["$quantitySold", "$pricePerKg"] } }
                }
            },
            {
                $match: { "_id.year": { $ne: null } } // Ensure year is not null
            },
            {
                $sort: { "_id.year": 1, "totalProfit": -1 }
            },
            {
                $group: {
                    _id: "$_id.year",
                    topVendor: { $first: "$_id.vendor" },
                    totalProfit: { $first: "$totalProfit" }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "topVendor",
                    foreignField: "_id",
                    as: "vendorDetails"
                }
            },
            {
                $unwind: "$vendorDetails"
            },
            {
                $project: {
                    _id: 1, // Year
                    vendorName: "$vendorDetails.name",
                    totalProfit: 1
                }
            }
        ]);

        // console.log(result); // Debugging log

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
async getTopVendorEachYear(req, res) {
    try {
        const result = await Vendor.aggregate([
            {
                $group: {
                    _id: { year: { $year: "$timestamp" }, vendor: "$vendor" },
                    totalProfit: { $sum: { $multiply: ["$quantitySold", "$pricePerKg"] } }
                }
            },
            {
                $match: { "_id.year": { $ne: null } } // Ensure year is not null
            },
            {
                $sort: { "_id.year": 1, "totalProfit": -1 }
            },
            {
                $group: {
                    _id: "$_id.year",
                    topVendor: { $first: "$_id.vendor" },
                    totalProfit: { $first: "$totalProfit" }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "topVendor",
                    foreignField: "_id",
                    as: "vendorDetails"
                }
            },
            {
                $unwind: "$vendorDetails"
            },
            {
                $project: {
                    year: "$_id",  // Rename _id to year
                    vendorName: "$vendorDetails.name",
                    totalProfit: 1,
                    _id: 0 // Remove _id
                }
            }
        ]);

        // console.log(result); // Debugging log

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

    async getUserCountsByCity(req, res) {
        try {
            const userCounts = await User.aggregate([
                {
                    $group: {
                        _id: "$address.city",
                        vendors: { $sum: { $cond: [{ $eq: ["$role", "vendor"] }, 1, 0] } },
                        customers: { $sum: { $cond: [{ $eq: ["$role", "customer"] }, 1, 0] } },
                        distributors: { $sum: { $cond: [{ $eq: ["$role", "distributor"] }, 1, 0] } }
                    }
                },
                { $sort: { _id: 1 } } // Sort by city name
            ]);
            // console.log(userCounts)
            res.status(200).json(userCounts);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch user counts", message: error.message });
        }
    }
    async updatePurchaseStatus(req, res) {
        const { purchaseId, status } = req.body; // Get purchaseId and new status from request body
        try {
            const purchase = await Purchase.findByIdAndUpdate(purchaseId, { status }, { new: true });
            if (!purchase) {
                return res.status(404).json({ error: "Purchase not found" });
            }
            res.json({ message: "Purchase status updated successfully", purchase });
        } catch (error) {
            console.error("Error updating purchase status:", error);
            res.status(500).json({ error: "Server error" });
        }
    }

    async getCustomerAnalysis(req, res) {
        try {
            const proPlusCount = await User.countDocuments({ subscription: 'pro plus' });
            const proCount = await User.countDocuments({ subscription: 'pro' });
            const normalCount = await User.countDocuments({ subscription: 'normal' });

            // Return data as JSON for frontend usage
            res.json({ proPlusCount, proCount, normalCount });
        } catch (error) {
            console.error('Error fetching customer analysis data:', error);
            res.status(500).json({ error: 'Error fetching customer analysis data' });
        }
    }

    async getPurchasesAnalysis(req, res) {
        try {
            const purchases = await Purchase.find().populate('items.item');
            const itemQuantities = {};

            purchases.forEach(purchase => {
                purchase.items.forEach(item => {
                    const itemName = item.name;
                    const quantity = item.quantity;

                    if (itemQuantities[itemName]) {
                        itemQuantities[itemName] += quantity;
                    } else {
                        itemQuantities[itemName] = quantity;
                    }
                });
            });

            const itemNames = Object.keys(itemQuantities);
            const quantities = Object.values(itemQuantities);

            res.json({ itemNames, quantities });
        } catch (error) {
            console.error('Error fetching purchases analysis:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

module.exports = new AdminController();
