const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    items: [
        {
            item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
            name: String,
            quantity: Number,
            pricePerKg: Number
        }
    ],
    purchaseDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['received', 'processing', 'shipped', 'completed'], default: 'received' },
    totalAmount: Number,
    address: Object,
    assignedDistributor:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
    distributorRating: { type: Number, min: 1, max: 5 },
    deliveryStatus: { type: String, enum: ['assigned', 'out for delivery', 'delivered'], default: 'assigned' }
});

module.exports = mongoose.model('Purchase', purchaseSchema);
