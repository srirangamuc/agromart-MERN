const mongoose = require("mongoose");
const User = require("../models/userModel");
const Distributor = require("../models/distributorModel");
const Purchase = require("../models/purchaseModel")

exports.getDistributorDetails = async (req, res) => {
    console.log("🔥 getDistributorDetails REACHED!");

    const distributorId = req.session.userId;

    if (!distributorId) {
        console.log("🚨 ERROR: No session userId found");
        return res.status(401).json({ message: "Not authenticated." });
    }

    try {
        console.log("🔍 Looking for distributor with ID:", distributorId);
        const distributor = await User.findById(distributorId);
        if (!distributor || distributor.role !== "distributor") {
            console.log("🚨 Distributor not found in User model");
            return res.status(404).json({ message: "Distributor details not found." });
        }

        console.log("✅ Distributor Found:", distributor);
        res.status(200).json(distributor);
    } catch (error) {
        console.error("❌ ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};



exports.updateAvailability = async (req, res) => {
    const distributorId = req.session.userId;

    if (!distributorId) {
        return res.status(401).json({ message: "Not authenticated." });
    }

    try {
        const { available } = req.body;

        // Check if the distributor exists in the User table
        const distributor = await User.findById(distributorId);
        if (!distributor || distributor.role !== "distributor") {
            return res.status(404).json({ message: "Distributor not found or unauthorized." });
        }

        let distributorItem = await Distributor.findOne({ user: distributorId });

        if (!distributorItem) {
            distributorItem = new Distributor({
                user: distributorId,
                available
            });
        } else {
            distributorItem.available = available;
        }

        await distributorItem.save();

        res.status(200).json({ message: "Availability updated successfully." });
    } catch (error) {
        console.error("Error updating availability:", error);
        res.status(500).json({ message: "Server error." });
    }
};

exports.updateDistributorInfo = async (req, res) => {
    const distributorId = req.session.userId;

    if (!distributorId) {
        return res.status(401).json({ message: "Not authenticated." });
    }

    try {
        const { contactPhone, address } = req.body;

        // Update the User model for the address
        const user = await User.findById(distributorId);
        if (!user || user.role !== "distributor") {
            return res.status(404).json({ message: "Distributor not found or unauthorized." });
        }

        if (address) {
            user.address = {
                hno: address.hno || user.address.hno,
                street: address.street || user.address.street,
                city: address.city || user.address.city,
                state: address.state || user.address.state,
                country: address.country || user.address.country,
                zipCode: address.zipCode || user.address.zipCode
            };
        }
        await user.save();

        // Update the Distributor model for the contactPhone
        const distributor = await Distributor.findOne({ user: distributorId });
        if (!distributor) {
            return res.status(404).json({ message: "Distributor details not found." });
        }

        if (contactPhone) distributor.contactPhone = contactPhone;
        await distributor.save();

        res.status(200).json({
            message: "Distributor information updated successfully.",
            contactPhone: distributor.contactPhone,
            address: user.address
        });
    } catch (error) {
        console.error("Error updating distributor info:", error);
        res.status(500).json({ message: "Server error." });
    }
};


exports.getAssignedPurchases = async (req, res) => {
    const distributorId = req.session.userId;

    if (!distributorId) {
        return res.status(401).json({ message: "Not authenticated." });
    }

    try {
        console.log("🔍 Fetching distributor details for user ID:", distributorId);
        
        // ✅ Fix: Ensure we are fetching distributor details correctly
        const distributor = await Distributor.findOne({ user: distributorId }).populate("user");
        if (!distributor) {
            console.log("🚨 ERROR: No distributor found for user ID:", distributorId);
            return res.status(404).json({ message: "Distributor not found." });
        }

        console.log("✅ Distributor Exists:", distributor);

        // ✅ Fix: Ensure purchases are assigned correctly
        const purchases = await Purchase.find({ assignedDistributor: distributorId })
            .populate("user", "name email") 
            .populate("items.item", "name pricePerKg");

        console.log("✅ Assigned Purchases Fetched:", purchases);

        res.status(200).json(purchases);
    } catch (error) {
        console.error("❌ Error fetching assigned purchases:", error);
        res.status(500).json({ message: "Server error." });
    }
};


exports.updateDeliveryStatus = async (req, res) => {
    const distributorId = req.session.userId;
    const { purchaseId, status } = req.body;

    if (!distributorId) {
        return res.status(401).json({ message: "Not authenticated." });
    }

    try {
        // Find the purchase assigned to the distributor
        const purchase = await Purchase.findOne({
            _id: purchaseId,
            assignedDistributor: distributorId
        });

        if (!purchase) {
            return res.status(404).json({ message: "Purchase not found or unauthorized." });
        }

        // Validate status update
        if (!["assigned", "out for delivery", "delivered"].includes(status)) {
            return res.status(400).json({ message: "Invalid status update." });
        }

        purchase.deliveryStatus = status;
        if (status === "delivered") {
            purchase.status = "completed";

            // Update distributor's total deliveries
            await Distributor.findOneAndUpdate(
                { user: distributorId },
                { $inc: { totalDeliveries: 1 } } // Increment total deliveries by 1
            );
        }

        await purchase.save();

        res.status(200).json({ message: "Delivery status updated successfully." });
    } catch (error) {
        console.error("Error updating delivery status:", error);
        res.status(500).json({ message: "Server error." });
    }
};


exports.rateDistributor = async (req, res) => {
    console.log("Rating system entered");
    try {
        const { purchaseId, rating } = req.body;
        console.log("Purchase ID:", purchaseId);
        console.log("Rating:", rating);

        // Validate rating
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        // Find purchase and check if already rated
        const purchase = await Purchase.findById(purchaseId).populate('assignedDistributor');
        if (!purchase) {
            return res.status(404).json({ message: "Purchase not found" });
        }

        if (!purchase.assignedDistributor) {
            return res.status(400).json({ message: "No distributor assigned to this purchase." });
        }

        // Fetch distributor details from Distributor model
        const distributor = await Distributor.findOne({ user: purchase.assignedDistributor._id });
        if (!distributor) {
            return res.status(404).json({ message: "Distributor not found in Distributor model." });
        }

        // Remove old rating if already rated before
        if (purchase.distributorRating) {
            distributor.totalRatings -= purchase.distributorRating;  // Subtract old rating
            distributor.ratingCount -= 1;  // Decrease count
        }

        // Update purchase with new rating
        purchase.distributorRating = rating;
        await purchase.save();

        // Update distributor's rating data
        distributor.totalRatings += rating;
        distributor.ratingCount += 1;
        distributor.averageRating = distributor.ratingCount > 0 
            ? (distributor.totalRatings / distributor.ratingCount).toFixed(2) 
            : 0;

        await distributor.save();

        res.json({ message: "Rating submitted successfully.", averageRating: distributor.averageRating });
    } catch (error) {
        console.error("Error in rating distributor:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};
exports.getDistributorDetails = async (req, res) => {
    const distributorId = req.session.userId;

    if (!distributorId) {
        return res.status(401).json({ message: "Not authenticated." });
    }

    try {
        // Fetch user (for address) and distributor (for contactPhone, availability, etc.)
        const user = await User.findById(distributorId);
        const distributor = await Distributor.findOne({ user: distributorId });

        if (!user || !distributor) {
            return res.status(404).json({ message: "Distributor details not found." });
        }

        res.status(200).json({
            name: user.name,
            email: user.email,
            contactPhone: distributor.contactPhone || "No phone number",
            address: user.address || null,
            available: distributor.available,
            totalDeliveries: distributor.totalDeliveries,
            averageRating: distributor.averageRating
        });
    } catch (error) {
        console.error("Error fetching distributor details:", error);
        res.status(500).json({ message: "Server error" });
    }
};
