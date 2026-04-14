const User = require("../models/User");

// Get academic records for all students
exports.getAcademicRecords = async (req, res) => {
    try {
        const query = { role: "student" };
        if (req.user.role === "faculty") {
            query.department = req.user.department;
        }
        const students = await User.find(query).select("name email rollNo department year section semester batch attendance cgpa backlogs");
        res.json(students);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update academic record
exports.updateAcademicRecord = async (req, res) => {
    try {
        if (req.user.role !== 'faculty') {
            return res.status(403).json({ message: "Only faculty members can update academic records" });
        }
        
        const { id } = req.params;
        const { attendance, cgpa, backlogs, semester } = req.body;
        
        const updateData = { attendance, cgpa, backlogs, semester };
        
        const student = await User.findByIdAndUpdate(id, { $set: updateData }, { new: true });
        if (!student) return res.status(404).json({ message: "Student record not found" });
        
        res.json(student);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get self academic profile
exports.getSelfAcademic = async (req, res) => {
    try {
        const id = req.user.id || req.user._id;
        const student = await User.findById(id).select("attendance cgpa backlogs department batch year section semester rollNo name");
        if (!student) return res.status(404).json({ message: "User not found" });
        res.json(student);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
