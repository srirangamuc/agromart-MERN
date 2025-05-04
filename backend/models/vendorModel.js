const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the vendor (User)
    itemName: { type: String, required: true },
    quantity: { type: Number, required: true },
    quantitySold : {type : Number, default : 0 },
    timestamp : {type: Date, default:Date.now},
    pricePerKg: { type: Number, required: true },
    profit: { type: Number, default:0 },


    // new fields to be added here regarding vendor rating

    // New fields for rating system
    ratingCount: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 }
});

vendorSchema.index({ vendor: 1 });
vendorSchema.index({ itemName: 1 });
vendorSchema.index({ timestamp: -1 })
vendorSchema.index({ itemName: 1 ,timestamp: -1 })
vendorSchema.index({ itemName: 1 ,vendor: 1 })

const Vendor = mongoose.model('Vendor', vendorSchema);
module.exports = Vendor;
