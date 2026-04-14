const jwt = require("jsonwebtoken");
const User = require("../models/User");

// General Auth Middleware
exports.auth = async (req, res, next) => {
    try {
        const token = req.headers.authorization;

        if (!token) return res.status(401).json("No token");

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);
        if (!user) return res.status(401).json("Invalid token");

        req.user = user;
        next();
    } catch (err) {
        res.status(401).json("Invalid token");
    }
};

// Admin Only Middleware
exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(403).json("Access denied. Admins only.");
    }
};