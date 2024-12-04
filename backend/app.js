const express = require("express");
const bodyparser = require('body-parser');
const mongoose = require("mongoose");
const session = require('express-session');
const bodyParser = require('body-parser')
const cors = require("cors")


const authController = require('./controllers/authController');



const vendorRoutes = require('./routes/vendorRoutes');
const customerRoutes = require('./routes/customerRoutes');
const adminRoutes = require("./routes/adminRoutes")


const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
    origin:'http://localhost:5173',
    credentials:true
}))
app.use(express.json())
app.use(session({
    secret: 'secretkey',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // Session expiry set to 24 hours
        httpOnly: true, // Makes the cookie accessible only by the server
        secure: process.env.NODE_ENV === 'production', // Set to true if using HTTPS in production
    }
}));


const dotenv = require('dotenv');
dotenv.config();


// MongoDB connection with error handling
mongoose.connect("mongodb+srv://freshmart:FDWyAmiXk89asnNd@freshmart.mtbq8.mongodb.net/farmer", {})
  .then(() => console.log('Database connection successful'))
  .catch(err => console.error("Database connection error", err));

app.use(bodyparser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(session({
    secret: 'secretkey',
    resave: false,
    saveUninitialized: false,
    cookie:{maxAge:1000*60*60*24}
}));

app.set('view engine', 'ejs');

// Home route
app.get('/', (req, res) => {
    res.render("index");
});

// Routes for authentication
app.get('/login', authController.renderAuth);
app.get('/signup', authController.renderAuth);
app.post('/login', authController.login);
app.post('/signup', authController.signup);
app.get('/logout', authController.logout);

// Dashboard routes
// app.get('/dashboard', dashboardController.getDashboard);
// app.get('/admin', dashboardController.getAdminDashboard);
// app.get('/vendor', dashboardController.getVendorDashboard);


app.use('/vendor',vendorRoutes)
app.use('/customer', customerRoutes);
app.use('/admin',adminRoutes)

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});
