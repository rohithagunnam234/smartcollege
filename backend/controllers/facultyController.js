const User = require("../models/User");
const bcrypt = require("bcryptjs");

// ➕ Add Faculty (Admin)
exports.addFaculty = async (req, res) => {
    try {
        const {
            name,
            email,
            personalEmail,
            password,
            department,
            phone
        } = req.body;

        const hashedPassword = await bcrypt.hash(password || "Password@123", 10);

        const faculty = await User.create({
            name,
            email,
            personalEmail,
            password: hashedPassword,
            role: "faculty",
            department,
            phone,
            status: "approved"
        });

        res.status(201).json(faculty);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all faculty
exports.getAllFaculty = async (req, res) => {
    try {
        const query = { role: "faculty" };
        if (req.user.role === "faculty") {
            query.department = req.user.department;
        }
        const users = await User.find(query);
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update faculty
exports.updateFaculty = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, personalEmail, password, department, phone, status } = req.body;
        
        let updateData = { name, email, personalEmail, department, phone, status };
        
        if (password && password.trim() !== "") {
          const hashedPassword = await bcrypt.hash(password, 10);
          updateData.password = hashedPassword;
        }

        const faculty = await User.findByIdAndUpdate(id, updateData, { new: true });
        if (!faculty) return res.status(404).json({ message: "Faculty not found" });
        
        res.json(faculty);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete faculty
exports.deleteFaculty = async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        res.json({ message: "Faculty deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
