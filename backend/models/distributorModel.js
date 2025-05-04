const mongoose = require('mongoose');

const distributorSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true, 
        unique: true 
    }, // Link back to User model
    contactPhone: { type: String},
    available: { type: Boolean, default: true },
    totalDeliveries: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 }
});

distributorSchema.index({ available:1});
distributorSchema.index({user:1});

const Distributor = mongoose.model('Distributor', distributorSchema);
module.exports = Distributor;
