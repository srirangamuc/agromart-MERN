const bcrypt = require('bcrypt');
const User = require('../models/userModel');

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
            return res.status(400).send("Email and password are required");
        }
    
        try {
            const user = await User.findOne({ email });
    
            if (!user) {
                console.error("No user found with the provided email:", email);
                return res.status(401).send("Invalid email or password");
            }
    
            const match = await bcrypt.compare(password, user.password);
    
            if (!match) {
                console.error("Password mismatch for email:", email);
                return res.status(401).send("Invalid email or password");
            }
    
            // Set session data
            req.session.userId = user._id.toString();
            req.session.userRole = user.role; // Optionally store role
            req.session.userName = user.name; // Optionally store name
        
            // Respond with user data
            return res.json({
                user: { _id: user._id, name: user.name, email: user.email,role:user.role },
                message: "Login successful",
            });
        } catch (error) {
            console.error("Error during login:", error);
            return res.status(500).send("Server error");
        }
    }

    // POST route for signup
    async signup(req, res) {
        console.log("Received signup request:", req.body);
    
        const { name, email, password } = req.body;
    
        if (!name || !email || !password) {
            console.error("Missing required fields in signup");
            return res.status(400).send("All fields are required");
        }
    
        try {
            const existingUser = await User.findOne({ email });
            console.log("Existing user check:", existingUser);
    
            if (existingUser) {
                console.error("Email already exists:", email);
                return res.status(409).send("Email already exists");
            }
    
            let role = "customer";
            const adminEmailRegex = /^admin\d+@freshmart\.com$/;
            const vendorEmailRegex = /^vendor\d+@freshmart\.com$/;
            if (adminEmailRegex.test(email)) {
                role = "admin";
            }
            else if (vendorEmailRegex.test(email)) {
                role = "vendor";
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            console.log("Hashed password generated");
    
            const newUser = new User({
                name,
                email,
                password: hashedPassword,
                role,
            });
    
            await newUser.save();
            console.log("New user saved:", newUser);
    
            req.session.userId = newUser._id.toString();
            req.session.userRole = newUser.role;
            req.session.userName = newUser.name;
    
            console.log("Session after signup:", req.session);
    
            if (role === "admin") {
                return res.redirect("/admin");
            } else {
                return res.redirect("/customer");
            }
        } catch (error) {
            console.error("Error during signup:", error);
            return res.status(500).send("Server error");
        }
    }

    // Logout route
    logout(req, res) {
        req.session.destroy((err) => {
            if (err) {
                console.error("Logout error:", err);
                return res.status(500).send('Server error');
            }
            res.redirect('/'); // Redirect to home after logout
        });
    }
}

// Export an instance of AuthController
module.exports = new AuthController();
