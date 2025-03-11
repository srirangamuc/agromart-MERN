const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

class AuthController {
    // Render login and signup pages
    renderAuth(req, res) {
        res.render('auth');
    }

    // POST route for login
    async login(req, res) {    
        const { email, password } = req.body;
    
        if (!email || !password) {
            console.error("Missing email or password");
            return res.status(400).json({ message: "Email and password are required" });
        }
    
        try {
            const user = await User.findOne({ email });
    
            if (!user) {
                console.error("No user found with the provided email:", email);
                return res.status(401).json({ message: "Invalid email or password" });
            }
    
            const match = await bcrypt.compare(password, user.password);
    
            if (!match) {
                console.error("Password mismatch for email:", email);
                return res.status(401).json({ message: "Invalid email or password" });
            }
    
            // Create JWT token
            const token = jwt.sign(
                { id: user._id, role: user.role },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '1d' }
            );
    
            // Set session data (can be kept for compatibility)
            req.session.userId = user._id.toString();
            req.session.userRole = user.role;
            req.session.userName = user.name;
        
            // Set token in cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            });
            
            // Respond with user data
            return res.json({
                user: { _id: user._id, name: user.name, email: user.email, role: user.role },
                token: token,
                message: "Login successful"
            });
        } catch (error) {
            console.error("Error during login:", error);
            return res.status(500).json({ message: "Server error" });
        }
    }

    // POST route for signup
    async signup(req, res) {
        console.log("Received signup request:", req.body);
    
        const { name, email, password, role } = req.body;
    
        if (!name || !email || !password || !role) {
            console.error("Missing required fields in signup");
            return res.status(400).json({ message: "All fields are required" });
        }
    
        try {
            const existingUser = await User.findOne({ email });
            console.log("Existing user check:", existingUser);
    
            if (existingUser) {
                console.error("Email already exists:", email);
                return res.status(409).json({ message: "Email already exists" });
            }
            
            // Validate role
            const validRoles = ['customer', 'vendor', 'distributor'];
            let userRole = role;
            
            // Check for admin email pattern (keeping this logic)
            const adminEmailRegex = /^admin\d+@freshmart\.com$/;
            if (adminEmailRegex.test(email)) {
                userRole = "admin";
            } else if (!validRoles.includes(role)) {
                return res.status(400).json({ message: "Invalid role selected" });
            }
            
            const hashedPassword = await bcrypt.hash(password, 10);
            console.log("Hashed password generated");
    
            const newUser = new User({
                name,
                email,
                password: hashedPassword,
                role: userRole,
            });
    
            await newUser.save();
            console.log("New user saved:", newUser);
            
            // Create JWT token
            const token = jwt.sign(
                { id: newUser._id, role: newUser.role },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '1d' }
            );
    
            // Set session data (can be kept for compatibility)
            req.session.userId = newUser._id.toString();
            req.session.userRole = newUser.role;
            req.session.userName = newUser.name;
            
            // Set token in cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            });
            
            // Response based on role or format
            if (req.headers['content-type'] === 'application/json') {
                return res.status(201).json({
                    user: { _id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role },
                    token: token,
                    message: "Signup successful"
                });
            } else {
                // Redirect based on role
                switch (userRole) {
                    case "admin":
                        return res.redirect("/admin");
                    case "vendor":
                        return res.redirect("/vendor");
                    case "distributor":
                        return res.redirect("/distributor");
                    default:
                        return res.redirect("/customer");
                }
            }
        } catch (error) {
            console.error("Error during signup:", error);
            return res.status(500).json({ message: "Server error" });
        }
    }

    // Logout route
    logout(req, res) {
        // Clear the JWT cookie
        res.clearCookie('token');
        
        // Also destroy session for compatibility
        req.session.destroy((err) => {
            if (err) {
                console.error("Logout error:", err);
                return res.status(500).json({ message: 'Server error' });
            }
            res.redirect('/'); // Redirect to home after logout
        });
    }
}

// Export an instance of AuthController
module.exports = new AuthController();