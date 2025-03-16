const jwt = require("jsonwebtoken");

const authenticateUser = (req, res, next) => {
    // Check for token in cookies or Authorization header
    let token = req.cookies.token;
    if (!token && req.headers.authorization) {
        const authHeader = req.headers.authorization;
        if (authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1]; // Extract token
        }
    }
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
            req.user = decoded;
            req.session.userId = decoded.id;  // ✅ Store in session for compatibility
            req.session.userRole = decoded.role;
            return next();
        } catch (error) {
            return res.status(401).json({ message: "Invalid token." });
        }
    }

    // ✅ If no token is found, fall back to session authentication
    if (req.session && req.session.userId) {
        // console.log("✅ Using session authentication:", req.session.userId);
        req.user = { id: req.session.userId, role: req.session.userRole };  // Simulate decoded JWT
        return next();
    }

    // console.log("🚨 No token or session found. Authorization denied.");
    return res.status(401).json({ message: "No token or session provided. Authorization denied." });
};

module.exports = authenticateUser;
