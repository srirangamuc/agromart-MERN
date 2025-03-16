const mongoose = require('mongoose');

// Define the schema for User
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    // There are three roles for our project
    role: {
        type: String,
        enum: ['admin', 'customer', 'vendor','distributor'],
        default: 'customer'
    },
    cart: [{
        vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }, // Track vendor
        item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' }, // Track item
        quantity: { type: Number, required: true },
        pricePerKg: { type: Number, required: true } // Store price in case vendors have different rates
    }],
    subscription: {
        type: String,
        enum: ['normal', 'pro', 'pro plus'],
        default: 'normal'
    },
    address: {
        hno:{type:String,default : null},
        street: { type: String, default : null },
        city: { type: String, default : null },
        state: { type: String, default : null },
        country:{type:String, default : null},
        zipCode: { type: String, default : null }
    },
    profilePicture: {type: String, default:null} // new field.
});

// Create the model from the schema
const User = mongoose.model('User', userSchema);

module.exports = User;
