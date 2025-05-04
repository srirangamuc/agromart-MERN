const jwt = require("jsonwebtoken");

const authenticateUser = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        // Log missing authorization header
        console.error("Authorization header missing");
        return res.status(401).json({ message: "Authorization token missing." });
    }

    if (authHeader && authHeader.startsWith("Bearer ")) {
        // Extract the token
        const token = authHeader.split(" ")[1];
        console.log("Received token:", token);

        try {
            // Verify the token using the secret
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach the decoded user data to the request object
            req.user = decoded;
            console.log("Decoded user:", decoded);

            // Proceed to the next middleware or route handler
            return next();
        } catch (err) {
            // Log the error if token verification fails
            console.error("Token verification failed:", err.message);
            return res.status(401).json({ message: "Invalid token." });
        }
    }

    // Log an error when the token is not prefixed with "Bearer"
    console.error("Invalid token format");
    return res.status(401).json({ message: "Authorization token format invalid." });
};

module.exports = authenticateUser;
