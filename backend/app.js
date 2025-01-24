const express = require("express");
const bodyparser = require('body-parser');
const mongoose = require("mongoose");
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require("cors");
const morgan = require("morgan");
const colors = require('colors');
const cookieParser = require('cookie-parser');
const authController = require('./controllers/authController');
const csrf = require("csurf");
const dotenv = require('dotenv');
const vendorRoutes = require('./routes/vendorRoutes');
const customerRoutes = require('./routes/customerRoutes');
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// Configure morgan logging
morgan.token('custom', (req, res) => {
    const method = req.method.blue.bold;
    const url = req.url.green;
    const status = `${res.statusCode}`.yellow;
    const responseTime = `${res.responseTime || 0}ms`.magenta;
    const timestamp = new Date().toLocaleString().cyan.bold;

    return [
        `Method: ${method}`,
        `URL: ${url}`,
        `Status: ${status}`,
        `Response Time: ${responseTime}`,
        `Time Stamp : ${timestamp}`
    ].join(' | ');
});

// Load environment variables
dotenv.config();

// Basic middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// CORS configuration
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    // exposedHeaders: ['csrf-token']
}));

// Cookie and session configuration
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'secretkey',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        // sameSite: 'lax'
    }
}));

// CSRF protection configuration
// cons = csrf({
//     cookie: {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: 'lax'
//     }
// });

// Logging middleware
app.use(morgan(":custom"));

// Static files and view engine setup
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Database connection
mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://freshmart:FDWyAmiXk89asnNd@freshmart.mtbq8.mongodb.net/farmer")
.then(() => console.log('Database connection successful'.green.bold))
.catch(err => console.error("Database connection error".red.bold, err));

// CSRF Error handling middleware
// app.use((err, req, res, next) => {
//     if (err.code === 'EBADCSRFTOKEN') {
//         res.status(403).json({
//             error: 'Invalid CSRF token',
//             message: 'Form submission failed. Please try again.'
//         });
//     } else {
//         next(err);
//     }
// });

// Routes that don't need CSRF protection
app.get('/', (req, res) => {
    res.render("index");
});

app.get('/csrf-token', (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

// Authentication routes with CSRF protection
app.get('/login', authController.renderAuth);
app.get('/signup', authController.renderAuth);
app.post('/login', authController.login);
app.post('/signup', authController.signup);
app.get('/logout', authController.logout);

// API routes with CSRF protection
app.use('/vendor', vendorRoutes);
app.use('/customer', customerRoutes);
app.use('/admin', adminRoutes);

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`.cyan.bold);
});