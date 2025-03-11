const jwt = require('jsonwebtoken');

const authenticateUser = (req, res, next) => {
    // Try to get token from cookies
    let token = req.cookies.token;

    // If not in cookies, check Authorization header
    if (!token && req.headers.authorization) {
        const authHeader = req.headers.authorization;
        if (authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1]; // Extract token
        }
    }
    if (!token) {
        return res.status(401).json({ message: "No token provided. Authorization denied." });
    }

    try {
        // Use the same secret as in AuthController
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');        
        // Add the user object to the request
        req.user = decoded;
        
        // Also set the session values for backward compatibility
        req.session = req.session || {};
        req.session.userId = decoded.id;
        req.session.userRole = decoded.role;
        
        next();
    } catch (error) {
        console.error("JWT verification failed:", error.message);
        return res.status(401).json({ message: "Invalid token." });
    }
};

module.exports = authenticateUser;