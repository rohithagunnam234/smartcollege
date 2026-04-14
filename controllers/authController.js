const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER
exports.register = async (req, res) => {
    try {
        const { name, email, password, role, personalEmail, rollNo, batch, department, year, section, semester, phone } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || "student",
            personalEmail, rollNo, batch, department, year, section, semester, phone,
            status: role === "admin" ? "approved" : "pending"
        });

        res.status(201).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// LOGIN
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        if ((user.role === "student" || user.role === "faculty") && user.status === "pending") {
            return res.status(403).json({ message: "Your account is pending admin approval." });
        }
        if ((user.role === "student" || user.role === "faculty") && user.status === "rejected") {
            return res.status(403).json({ message: "Your registration has been rejected." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({ token, user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};