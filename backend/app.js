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
const fs = require('fs');
const path = require('path');
const vendorRoutes = require('./routes/vendorRoutes');
const customerRoutes = require('./routes/customerRoutes');
const adminRoutes = require("./routes/adminRoutes");
const distributorRoutes = require("./routes/distributorRoutes");

const app = express();

// Load environment variables
dotenv.config();

// Create logs directory if it doesn't exist
const logDirectory = path.join(__dirname, 'logs');
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

// Helper function to get current date for log filenames
const getLogFilename = (prefix) => {
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    return path.join(logDirectory, `${prefix}-${date}.log`);
};

// Helper function to append to log files
const appendToLog = (filename, data) => {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(filename, `${timestamp} - ${data}\n`, { flag: 'a' });
};

// Configure morgan logging for console
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

// Configure morgan logging for file (without colors)
morgan.token('file-format', (req, res) => {
    const method = req.method;
    const url = req.url;
    const status = res.statusCode;
    const responseTime = res.responseTime || 0;
    const timestamp = new Date().toLocaleString();
    
    return [
        `Method: ${method}`,
        `URL: ${url}`,
        `Status: ${status}`,
        `Response Time: ${responseTime}ms`,
        `Time Stamp: ${timestamp}`
    ].join(' | ');
});

// Custom stream for morgan to write to access log file
const accessLogStream = {
    write: (message) => {
        fs.appendFileSync(getLogFilename('access'), message);
    }
};

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
const csrfProtection = csrf({
    cookie: {
        httpOnly: true,
  
    }
});

// Logging middleware
app.use(morgan(':custom')); // Console logging
app.use(morgan(':file-format', { stream: accessLogStream })); // File logging

// Custom error logger middleware
app.use((req, res, next) => {
    const originalSend = res.send;
    res.send = function(data) {
        if (res.statusCode >= 400) {
            const errorLog = {
                timestamp: new Date().toISOString(),
                method: req.method,
                url: req.url,
                status: res.statusCode,
                body: req.body,
                query: req.query,
                params: req.params,
                error: data
            };
            appendToLog(getLogFilename('error'), JSON.stringify(errorLog));
        }
        return originalSend.call(this, data);
    };
    next();
});

// Static files and view engine setup
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Database connection
mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://freshmart:FDWyAmiXk89asnNd@freshmart.mtbq8.mongodb.net/farmer")
    .then(() => console.log('Database connection successful'.green.bold))
    .catch(err => {
        console.error("Database connection error".red.bold, err);
        // Log database errors to file
        appendToLog(getLogFilename('db-errors'), err.message);
    });

app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        res.status(403).json({
            error: 'Invalid CSRF token',
            message: 'Form submission failed. Please try again.'
        });
    } else {
        next(err);
    }
});

// Routes that don't need CSRF protection
app.get('/', (req, res) => {
    res.render("index");
});

app.get('/csrf-token', (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

// Authentication routes with CSRF protection
app.post('/api/login', authController.login);
app.post('/api/signup', authController.signup);
app.get('/api/logout', authController.logout);

// API routes with CSRF protection
app.use('/api/vendor', vendorRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/admin', adminRoutes);
app.use("/api/distributor", distributorRoutes);

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    // Log errors to file
    appendToLog(getLogFilename('server-errors'), err.stack);
    
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`.cyan.bold);
    // Log server start to file
    appendToLog(getLogFilename('server'), `Server started on port ${PORT}`);
});