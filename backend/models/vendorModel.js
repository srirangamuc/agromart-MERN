const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the vendor (User)
    itemName: { type: String, required: true },
    quantity: { type: Number, required: true },
    quantitySold : {type : Number, default : 0 },
    timestamp : {type: Date, default:Date.now},
    pricePerKg: { type: Number, required: true },
    profit: { type: Number, default:0 } 

});

const Vendor = mongoose.model('Vendor', vendorSchema);
module.exports = Vendor;
