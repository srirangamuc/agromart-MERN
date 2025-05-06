/*const express = require("express");
const mongoose = require("mongoose");
const session = require('express-session');
const cors = require("cors");
const colors = require("colors");
const morgan = require("morgan");
const cookieParser = require('cookie-parser');
const authController = require('./controllers/authController');
const csrf = require("csurf");
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

const vendorRoutes = require('./routes/vendorRoutes');
const customerRoutes = require('./routes/customerRoutes');
const adminRoutes = require("./routes/adminRoutes");
const distributorRoutes = require("./routes/distributorRoutes");

const app = express();

// Load environment variables
dotenv.config();

const allowedOrigins = [
    "https://agromart-mern-frontend.onrender.com",
    "http://localhost:5173",
    "http://localhost/" // for local development
  ];
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    },
    allowedHeaders: [
      'Content-Type',
      'Authorization',
    ],
    exposedHeaders: [
      'Authorization',
    ],
    methods: [
      'GET',
      'POST',
      'PUT',
      'DELETE',
      'OPTIONS',
    ],
  }));


app.use(express.static('public'));
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve uploaded files


// Request parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
 // Parse JSON requests

app.use(
    session({
        secret: process.env.SESSION_SECRET || "secretkey", // Use environment variable for security
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 86400000, // Cookie expiration (1 day in milliseconds)
            httpOnly: true,    // Prevent JavaScript access to cookies
            secure: true, // Set to true in production, false in development
            sameSite: 'None',  // Allow cross-origin cookies, useful if frontend and backend are on different domains/subdomains
        },
    })
);

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



// const csrfProtection = csrf({
//     cookie: {
//         httpOnly: true,
  
//     }
// });

// Logging middleware
app.use(morgan(':custom')); // Console logging
app.use(morgan(':file-format', { stream: accessLogStream })); // File logging

// app.use((req, res, next) => {
//     console.log("🟢 SESSION DATA:", req.session);
//     next();
// });


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
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.post('/api/login', authController.login);
app.post('/api/signup', authController.signup);
app.get('/api/logout', authController.logout);




// API routes with CSRF protection


// Limit request body size to 10MB
app.use('/api/vendor', vendorRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/admin', adminRoutes);
app.use("/api/distributor", distributorRoutes);


// Database connection
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/farmer",{autoIndex:true})
.then(() => console.log('Connected to MongoDB'.green.bold))
.catch(err => {
    console.error("Local Database connection error".red.bold, err);
});


// Authentication routes with CSRF protection
app.get("/",(req,res)=>{
    res.send("Agromart API is working")
})



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
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`.cyan.bold);
//     // Log server start to file
//     appendToLog(getLogFilename('server'), `Server started on port ${PORT}`);
// });

module.exports = app; // Export the app for testing purposes*/

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const authController = require("./controllers/authController");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");

const vendorRoutes = require("./routes/vendorRoutes");
const customerRoutes = require("./routes/customerRoutes");
const adminRoutes = require("./routes/adminRoutes");
const distributorRoutes = require("./routes/distributorRoutes");

const app = express();

// Load environment variables
dotenv.config();

// CORS Configuration
const allowedOrigins = [
  "https://agromart-mern-frontend.onrender.com",
  "http://localhost:5173",
  "http://localhost/"
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// Serve static files
app.use(express.static("public"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Request parsers
app.use((req, res, next) => {
  const contentType = req.headers['content-type'] || '';

  if (contentType.includes('application/json')) {
    express.json({ limit: '10mb' })(req, res, next);
  } else {
    next(); // skip JSON parser for form-data
  }
});
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secretkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 86400000,
      httpOnly: true,
      secure: true,
      sameSite: "None",
    },
  })
);

// Create logs directory
const logDirectory = path.join(__dirname, "logs");
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

// Log file helper
const getLogFilename = (prefix) => {
  const date = new Date().toISOString().split("T")[0];
  return path.join(logDirectory, `${prefix}-${date}.log`);
};

const appendToLog = (filename, data) => {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(filename, `${timestamp} - ${data}\n`, { flag: "a" });
};

// Morgan custom token without colors for safe logging
morgan.token("custom", (req, res) => {
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
    `Time: ${timestamp}`
  ].join(" | ");
});

morgan.token("file-format", (req, res) => {
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
  ].join(" | ");
});

// Morgan log stream for file
const accessLogStream = {
  write: (message) => {
    fs.appendFileSync(getLogFilename("access"), message);
  },
};

// Logging middleware
app.use(morgan(":custom")); // Console
app.use(morgan(":file-format", { stream: accessLogStream })); // File

// Error logging middleware
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function (data) {
    if (res.statusCode >= 400) {
      const errorLog = {
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
        status: res.statusCode,
        body: req.body,
        query: req.query,
        params: req.params,
        error: data,
      };
      appendToLog(getLogFilename("error"), JSON.stringify(errorLog));
    }
    return originalSend.call(this, data);
  };
  next();
});

// Swagger docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Auth endpoints
app.post("/api/login", authController.login);
app.post("/api/signup", authController.signup);
app.get("/api/logout", authController.logout);

// API routes
app.use("/api/vendor", vendorRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/distributor", distributorRoutes);
app.use("/api/test",require("./routes/testUpload"));

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/farmer", {
    autoIndex: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("Local Database connection error", err);
  });

// Health check route
app.get("/", (req, res) => {
  res.send("Agromart API is working");
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  appendToLog(getLogFilename("server-errors"), err.stack);

  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong!",
  });
});

module.exports = app;
