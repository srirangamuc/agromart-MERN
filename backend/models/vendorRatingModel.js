const mongoose = require('mongoose');

const vendorRatingSchema = new mongoose.Schema({
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ratingCount: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
});

vendorRatingSchema.index({ vendor: 1 }, { unique: true });
const VendorRating = mongoose.model('VendorRating', vendorRatingSchema);
module.exports = VendorRating;
