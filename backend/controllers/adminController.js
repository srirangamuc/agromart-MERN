/*const Purchase = require('../models/purchaseModel');
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

module.exports = new AdminController();*/


const Purchase = require('../models/purchaseModel');
const User = require('../models/userModel');
const Item = require('../models/itemModel');
const VendorRating = require('../models/vendorRatingModel');
const Distributor = require('../models/distributorModel');
const Vendor = require('../models/vendorModel');
const redisClient = require('../redis_client'); // Import Redis client

class AdminController {
    // Helper method to cache admin dashboard data
    async cacheAdminDashboard() {
        try {
            const purchases = await Purchase.find().populate('user').exec();
            const proPlusCustomers = await User.find({ role: 'customer', subscription: 'pro plus' }).sort({ createdAt: -1 });
            const proCustomers = await User.find({ role: 'customer', subscription: 'pro' }).sort({ createdAt: -1 });
            const normalCustomers = await User.find({ role: 'customer', subscription: 'normal' }).sort({ createdAt: -1 });
            const vendors = await User.find({ role: 'vendor' }).sort({ createdAt: -1 });

            const dashboardData = {
                purchases,
                proPlusCustomers,
                proCustomers,
                normalCustomers,
                vendors
            };

            try {
                await redisClient.setEx('admin_dashboard', 3600, JSON.stringify(dashboardData));
               // console.log('Cached admin dashboard data in Redis');
            } catch (redisError) {
                console.error('Failed to cache admin dashboard data:', redisError.message);
            }

            return dashboardData;
        } catch (error) {
            console.error('Error caching admin dashboard data:', error);
            throw error;
        }
    }

    async getAdminDashboard(req, res) {
        try {
            let dashboardData = null;
            try {
                const cachedData = await redisClient.get('admin_dashboard');
                if (cachedData) {
                    dashboardData = JSON.parse(cachedData);
                   // console.log('Retrieved admin dashboard data from Redis');
                }
            } catch (redisError) {
                console.error('Redis error in getAdminDashboard:', redisError.message);
            }

            if (!dashboardData) {
               // console.log('Cache miss, fetching admin dashboard data from MongoDB');
                dashboardData = await this.cacheAdminDashboard();
            }

            res.json(dashboardData);
        } catch (error) {
            console.error('Error fetching admin dashboard data:', error);
            res.status(500).json({ error: 'Error fetching admin dashboard data' });
        }
    }

    // Helper method to cache ratings data
    async cacheRatingsData() {
        try {
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

            const deliveryGuys = await Distributor.find();
            const deliveryRatings = { '0-1': 0, '1-2': 0, '2-3': 0, '3-4': 0, '4-5': 0 };
            let deliveryTotalRating = 0, deliveryCount = 0;

            deliveryGuys.forEach(delivery => {
                if (delivery.totalDeliveries) {
                    deliveryTotalRating += delivery.averageRating;
                    deliveryCount++;
                    const avg = delivery.averageRating;
                    if (avg <= 1) deliveryRatings['0-1']++;
                    else if (avg <= 2) deliveryRatings['1-2']++;
                    else if (avg <= 3) deliveryRatings['2-3']++;
                    else if (avg <= 4) deliveryRatings['3-4']++;
                    else deliveryRatings['4-5']++;
                }
            });

            const ratingsData = {
                vendorRatings,
                vendorAvg: vendorCount ? (vendorTotalRating / vendorCount).toFixed(2) : 'N/A',
                deliveryRatings,
                deliveryAvg: deliveryCount ? (deliveryTotalRating / deliveryCount).toFixed(2) : 'N/A'
            };

            try {
                await redisClient.setEx('ratings_data', 3600, JSON.stringify(ratingsData));
                //console.log('Cached ratings data in Redis');
            } catch (redisError) {
                console.error('Failed to cache ratings data:', redisError.message);
            }

            return ratingsData;
        } catch (error) {
            console.error('Error caching ratings data:', error);
            throw error;
        }
    }

    async getRatingsData(req, res) {
        try {
            let ratingsData = null;
            try {
                const cachedData = await redisClient.get('ratings_data');
                if (cachedData) {
                    ratingsData = JSON.parse(cachedData);
                    //console.log('Retrieved ratings data from Redis');
                }
            } catch (redisError) {
                console.error('Redis error in getRatingsData:', redisError.message);
            }

            if (!ratingsData) {
                console.log('Cache miss, fetching ratings data from MongoDB');
                ratingsData = await this.cacheRatingsData();
            }

            res.json(ratingsData);
        } catch (error) {
            console.error('Error fetching rating data:', error);
            res.status(500).json({ error: 'Server error' });
        }
    }

    // Helper method to cache rated and unrated vendors
    async cacheRatedAndUnratedVendors() {
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

            const vendorData = { ratedVendors, unratedVendors };

            try {
                await redisClient.setEx('rated_unrated_vendors', 3600, JSON.stringify(vendorData));
               // console.log('Cached rated and unrated vendors in Redis');
            } catch (redisError) {
                console.error('Failed to cache rated and unrated vendors:', redisError.message);
            }

            return vendorData;
        } catch (error) {
            console.error('Error caching rated and unrated vendors:', error);
            throw error;
        }
    }

    async getRatedAndUnratedVendors(req, res) {
        try {
            let vendorData = null;
            try {
                const cachedData = await redisClient.get('rated_unrated_vendors');
                if (cachedData) {
                    vendorData = JSON.parse(cachedData);
                    //console.log('Retrieved rated and unrated vendors from Redis');
                }
            } catch (redisError) {
                console.error('Redis error in getRatedAndUnratedVendors:', redisError.message);
            }

            if (!vendorData) {
                //console.log('Cache miss, fetching rated and unrated vendors from MongoDB');
                vendorData = await this.cacheRatedAndUnratedVendors();
            }

            res.json(vendorData);
        } catch (error) {
            console.error('Error fetching rated and unrated vendors:', error);
            res.status(500).json({ error: 'Server error' });
        }
    }

    // No caching for getVendorDetails (dynamic input, specific vendor)

    // Helper method to cache top item each year
    async cacheTopItemEachYear() {
        try {
            const result = await Vendor.aggregate([
                {
                    $group: {
                        _id: { year: { $year: '$timestamp' }, itemName: '$itemName' },
                        totalSold: { $sum: '$quantitySold' }
                    }
                },
                {
                    $match: { '_id.year': { $ne: null } }
                },
                {
                    $sort: { '_id.year': 1, 'totalSold': -1 }
                },
                {
                    $group: {
                        _id: '$_id.year',
                        topItem: { $first: '$_id.itemName' },
                        totalSold: { $first: '$totalSold' }
                    }
                },
                {
                    $project: {
                        year: '$_id',
                        topItem: 1,
                        totalSold: 1,
                        _id: 0
                    }
                }
            ]);

            try {
                await redisClient.setEx('top_item_each_year', 3600, JSON.stringify(result));
               // console.log('Cached top item each year in Redis');
            } catch (redisError) {
                console.error('Failed to cache top item each year:', redisError.message);
            }

            return result;
        } catch (error) {
            console.error('Error caching top item each year:', error);
            throw error;
        }
    }

    async getTopItemEachYear(req, res) {
        try {
            let result = null;
            try {
                const cachedData = await redisClient.get('top_item_each_year');
                if (cachedData) {
                    result = JSON.parse(cachedData);
                   // console.log('Retrieved top item each year from Redis');
                }
            } catch (redisError) {
                console.error('Redis error in getTopItemEachYear:', redisError.message);
            }

            if (!result) {
                //console.log('Cache miss, fetching top item each year from MongoDB');
                result = await this.cacheTopItemEachYear();
            }

            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Helper method to cache top vendor each year
    async cacheTopVendorEachYear() {
        try {
            const result = await Vendor.aggregate([
                {
                    $group: {
                        _id: { year: { $year: '$timestamp' }, vendor: '$vendor' },
                        totalProfit: { $sum: { $multiply: ['$quantitySold', '$pricePerKg'] } }
                    }
                },
                {
                    $match: { '_id.year': { $ne: null } }
                },
                {
                    $sort: { '_id.year': 1, 'totalProfit': -1 }
                },
                {
                    $group: {
                        _id: '$_id.year',
                        topVendor: { $first: '$_id.vendor' },
                        totalProfit: { $first: '$totalProfit' }
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'topVendor',
                        foreignField: '_id',
                        as: 'vendorDetails'
                    }
                },
                {
                    $unwind: '$vendorDetails'
                },
                {
                    $project: {
                        year: '$_id',
                        vendorName: '$vendorDetails.name',
                        totalProfit: 1,
                        _id: 0
                    }
                }
            ]);

            try {
                await redisClient.setEx('top_vendor_each_year', 3600, JSON.stringify(result));
               // console.log('Cached top vendor each year in Redis');
            } catch (redisError) {
                console.error('Failed to cache top vendor each year:', redisError.message);
            }

            return result;
        } catch (error) {
            console.error('Error caching top vendor each year:', error);
            throw error;
        }
    }

    async getTopVendorEachYear(req, res) {
        try {
            let result = null;
            try {
                const cachedData = await redisClient.get('top_vendor_each_year');
                if (cachedData) {
                    result = JSON.parse(cachedData);
                   // console.log('Retrieved top vendor each year from Redis');
                }
            } catch (redisError) {
                console.error('Redis error in getTopVendorEachYear:', redisError.message);
            }

            if (!result) {
               // console.log('Cache miss, fetching top vendor each year from MongoDB');
                result = await this.cacheTopVendorEachYear();
            }

            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Helper method to cache user counts by city
    async cacheUserCountsByCity() {
        try {
            const userCounts = await User.aggregate([
                {
                    $group: {
                        _id: '$address.city',
                        vendors: { $sum: { $cond: [{ $eq: ['$role', 'vendor'] }, 1, 0] } },
                        customers: { $sum: { $cond: [{ $eq: ['$role', 'customer'] }, 1, 0] } },
                        distributors: { $sum: { $cond: [{ $eq: ['$role', 'distributor'] }, 1, 0] } }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            try {
                await redisClient.setEx('user_counts_by_city', 3600, JSON.stringify(userCounts));
               // console.log('Cached user counts by city in Redis');
            } catch (redisError) {
                console.error('Failed to cache user counts by city:', redisError.message);
            }

            return userCounts;
        } catch (error) {
            console.error('Error caching user counts by city:', error);
            throw error;
        }
    }

    async getUserCountsByCity(req, res) {
        try {
            let userCounts = null;
            try {
                const cachedData = await redisClient.get('user_counts_by_city');
                if (cachedData) {
                    userCounts = JSON.parse(cachedData);
                    console.log('Retrieved user counts by city from Redis');
                }
            } catch (redisError) {
               // console.error('Redis error in getUserCountsByCity:', redisError.message);
            }

            if (!userCounts) {
               // console.log('Cache miss, fetching user counts by city from MongoDB');
                userCounts = await this.cacheUserCountsByCity();
            }

            res.status(200).json(userCounts);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch user counts', message: error.message });
        }
    }

    // Helper method to cache customer analysis
    async cacheCustomerAnalysis() {
        try {
            const proPlusCount = await User.countDocuments({ subscription: 'pro plus' });
            const proCount = await User.countDocuments({ subscription: 'pro' });
            const normalCount = await User.countDocuments({ subscription: 'normal' });

            const customerAnalysis = { proPlusCount, proCount, normalCount };

            try {
                await redisClient.setEx('customer_analysis', 3600, JSON.stringify(customerAnalysis));
               // console.log('Cached customer analysis in Redis');
            } catch (redisError) {
                console.error('Failed to cache customer analysis:', redisError.message);
            }

            return customerAnalysis;
        } catch (error) {
            console.error('Error caching customer analysis:', error);
            throw error;
        }
    }

    async getCustomerAnalysis(req, res) {
        try {
            let customerAnalysis = null;
            try {
                const cachedData = await redisClient.get('customer_analysis');
                if (cachedData) {
                    customerAnalysis = JSON.parse(cachedData);
                   // console.log('Retrieved customer analysis from Redis');
                }
            } catch (redisError) {
                console.error('Redis error in getCustomerAnalysis:', redisError.message);
            }

            if (!customerAnalysis) {
                //console.log('Cache miss, fetching customer analysis from MongoDB');
                customerAnalysis = await this.cacheCustomerAnalysis();
            }

            res.json(customerAnalysis);
        } catch (error) {
            console.error('Error fetching customer analysis data:', error);
            res.status(500).json({ error: 'Error fetching customer analysis data' });
        }
    }

    // Helper method to cache purchases analysis
    async cachePurchasesAnalysis() {
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

            const purchasesAnalysis = {
                itemNames: Object.keys(itemQuantities),
                quantities: Object.values(itemQuantities)
            };

            try {
                await redisClient.setEx('purchases_analysis', 3600, JSON.stringify(purchasesAnalysis));
                //console.log('Cached purchases analysis in Redis');
            } catch (redisError) {
                console.error('Failed to cache purchases analysis:', redisError.message);
            }

            return purchasesAnalysis;
        } catch (error) {
            console.error('Error caching purchases analysis:', error);
            throw error;
        }
    }

    async getPurchasesAnalysis(req, res) {
        try {
            let purchasesAnalysis = null;
            try {
                const cachedData = await redisClient.get('purchases_analysis');
                if (cachedData) {
                    purchasesAnalysis = JSON.parse(cachedData);
                    //console.log('Retrieved purchases analysis from Redis');
                }
            } catch (redisError) {
                console.error('Redis error in getPurchasesAnalysis:', redisError.message);
            }

            if (!purchasesAnalysis) {
                //console.log('Cache miss, fetching purchases analysis from MongoDB');
                purchasesAnalysis = await this.cachePurchasesAnalysis();
            }

            res.json(purchasesAnalysis);
        } catch (error) {
            console.error('Error fetching purchases analysis:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // Unchanged methods
    async getVendorDetails(req, res) {
        try {
            const { vendorId } = req.body;
            const vendor = await User.findById(vendorId);

            if (!vendor || vendor.role !== 'vendor') {
                return res.status(404).json({ error: 'Vendor not found' });
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

            res.json({ vendorDetails, vendorStock, vendorProfit });
        } catch (error) {
            console.error('Error fetching vendor details:', error);
            res.status(500).json({ error: 'Server error' });
        }
    }

    async updatePurchaseStatus(req, res) {
        const { purchaseId, status } = req.body;
        try {
            const purchase = await Purchase.findByIdAndUpdate(purchaseId, { status }, { new: true });
            if (!purchase) {
                return res.status(404).json({ error: 'Purchase not found' });
            }
            res.json({ message: 'Purchase status updated successfully', purchase });
        } catch (error) {
            console.error('Error updating purchase status:', error);
            res.status(500).json({ error: 'Server error' });
        }
    }
}

module.exports = new AdminController();
