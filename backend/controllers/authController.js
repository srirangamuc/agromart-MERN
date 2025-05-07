const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const Distributor = require("../models/distributorModel");

class AuthController {
    renderAuth(req, res) {
        res.render('auth');
    }

    async login(req, res) {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        try {
            const user = await User.findOne({ email });
            if (!user || !(await bcrypt.compare(password, user.password))) {
                return res.status(401).json({ message: "Invalid email or password" });
            }

            const token = jwt.sign(
                { id: user._id, role: user.role },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '1d' }
            );

            req.session.regenerate((err) => {
                if (err) {
                    return res.status(500).json({ message: "Session error" });
                }
                req.session.userId = user._id.toString();
                req.session.userRole = user.role;
                req.session.userName = user.name;
                req.session.save((err) => {
                    if (err) {
                        return res.status(500).json({ message: "Session save failed" });
                    }
                    res.cookie('token', token, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        maxAge: 24 * 60 * 60 * 1000
                    });
                    res.json({ user: { _id: user._id, name: user.name, email: user.email, role: user.role }, token, message: "Login successful" });
                });
            });
        } catch (error) {
            console.error("Error during login:", error);
            return res.status(500).json({ message: "Server error" });
        }
    }

    /*async signup(req, res) {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: "All fields are required" });
        }

        try {
            if (await User.findOne({ email })) {
                return res.status(409).json({ message: "Email already exists" });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            let userRole = role;
            if (/^admin\d+@freshmart\.com$/.test(email)) {
                userRole = "admin";
            }

            const newUser = new User({ name, email, password: hashedPassword, role: userRole });
            await newUser.save();

            if (role === "distributor") {
                await new Distributor({ user: newUser._id.toString(), contactPhone: "", available: false, totalDeliveries: 0, ratingCount: 0, totalRatings: 0, averageRating: 0 }).save();
            }

            const token = jwt.sign(
                { id: newUser._id, role: newUser.role },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '1d' }
            );

            req.session.regenerate((err) => {
                if (err) {
                    return res.status(500).json({ message: "Session error" });
                }
                req.session.userId = newUser._id.toString();
                req.session.userRole = newUser.role;
                req.session.userName = newUser.name;
                req.session.save((err) => {
                    if (err) {
                        return res.status(500).json({ message: "Session save failed" });
                    }
                    res.cookie('token', token, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        maxAge: 24 * 60 * 60 * 1000
                    });
                    res.status(201).json({ user: { _id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role }, token, message: "Signup successful" });
                });
            });
        } catch (error) {
            console.error("Error during signup:", error);
            return res.status(500).json({ message: "Server error" });
        }
    }*/
    async signup(req, res) {
        const { name, email, password, role } = req.body;
    
        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: "All fields are required" });
        }
    
        // Password validation regex: at least 8 characters, 1 uppercase, 1 number, 1 special char
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long and include 1 uppercase letter, 1 number, and 1 special character."
            });
        }
    
        try {
            if (await User.findOne({ email })) {
                return res.status(409).json({ message: "Email already exists" });
            }
    
            const hashedPassword = await bcrypt.hash(password, 10);
            let userRole = role;
            if (/^admin\d+@freshmart\.com$/.test(email)) {
                userRole = "admin";
            }
    
            const newUser = new User({ name, email, password: hashedPassword, role: userRole });
            await newUser.save();
    
            if (role === "distributor") {
                await new Distributor({
                    user: newUser._id.toString(),
                    contactPhone: "",
                    available: false,
                    totalDeliveries: 0,
                    ratingCount: 0,
                    totalRatings: 0,
                    averageRating: 0
                }).save();
            }
    
            const token = jwt.sign(
                { id: newUser._id, role: newUser.role },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '1d' }
            );
    
            req.session.regenerate((err) => {
                if (err) {
                    return res.status(500).json({ message: "Session error" });
                }
                req.session.userId = newUser._id.toString();
                req.session.userRole = newUser.role;
                req.session.userName = newUser.name;
                req.session.save((err) => {
                    if (err) {
                        return res.status(500).json({ message: "Session save failed" });
                    }
                    res.cookie('token', token, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        maxAge: 24 * 60 * 60 * 1000
                    });
                    res.status(201).json({
                        user: {
                            _id: newUser._id,
                            name: newUser.name,
                            email: newUser.email,
                            role: newUser.role
                        },
                        token,
                        message: "Signup successful"
                    });
                });
            });
        } catch (error) {
            console.error("Error during signup:", error);
            return res.status(500).json({ message: "Server error" });
        }
    }
        

    logout(req, res) {
        res.clearCookie('token');
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ message: 'Server error' });
            }
            res.redirect('/');
        });
    }
}

module.exports = new AuthController();
