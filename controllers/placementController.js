const User = require("../models/User");

// Get placement records for all students (4th year only)
exports.getPlacementRecords = async (req, res) => {
    try {
        const query = { role: "student", year: "4" };
        if (req.user.role === "faculty") {
            query.department = req.user.department;
        }
        const students = await User.find(query).select("name email rollNo department year section batch placed companiesSelected selectedCompanies");
        res.json(students);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update placement record
exports.updatePlacementRecord = async (req, res) => {
    try {
        if (req.user.role !== 'faculty') {
            return res.status(403).json({ message: "Only faculty (TPO) members can update placement records" });
        }
        
        const { id } = req.params;
        const { placed, companiesSelected, selectedCompanies } = req.body;
        
        const updateData = {};
        if (placed !== undefined) updateData.placed = placed;
        if (companiesSelected !== undefined) updateData.companiesSelected = companiesSelected;
        if (selectedCompanies !== undefined) updateData.selectedCompanies = selectedCompanies;
        
        const student = await User.findByIdAndUpdate(id, { $set: updateData }, { new: true });
        if (!student) return res.status(404).json({ message: "Student record not found" });
        
        res.json(student);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get self placement profile
exports.getSelfPlacement = async (req, res) => {
    try {
        const id = req.user.id || req.user._id;
        const student = await User.findById(id).select("placed companiesSelected selectedCompanies name rollNo department batch year");
        if (!student) return res.status(404).json({ message: "User not found" });
        res.json(student);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
