const User = require("../models/User");
const bcrypt = require("bcryptjs");

// ➕ Add Student (Admin)
exports.addStudent = async (req, res) => {
    try {
        const {
            name,
            email,
            personalEmail,
            password,
            batch,
            department,
            year,
            section,
            semester,
            phone,
            rollNo,
            attendance,
            cgpa,
            backlogs,
            placed,
            companiesSelected
        } = req.body;

        const hashedPassword = await bcrypt.hash(password || "Password@123", 10);

        const student = await User.create({
            name,
            email,
            personalEmail,
            password: hashedPassword,
            role: "student",
            batch,
            department,
            year,
            section,
            semester,
            phone,
            rollNo,
            status: "approved",
            attendance: attendance || 0,
            cgpa: cgpa || 0,
            backlogs: backlogs || 0,
            placed: placed || "Pending",
            companiesSelected: companiesSelected || 0
        });

        res.status(201).json(student);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ➕ Bulk Add Students (Admin)
exports.addBulkStudents = async (req, res) => {
    try {
        const { students } = req.body;
        if (!students || !Array.isArray(students)) {
            return res.status(400).json({ message: "Invalid payload, expected array of students." });
        }

        const formattedStudents = await Promise.all(students.map(async (s) => {
            const hashedPassword = await bcrypt.hash(s.password || "Password@123", 10);
            return {
                name: s.name,
                email: s.email,
                personalEmail: s.personalEmail || "",
                password: hashedPassword,
                role: "student",
                batch: s.batch,
                department: s.department,
                year: s.year,
                section: s.section,
                semester: s.semester,
                phone: s.phone,
                rollNo: s.rollNo,
                status: "approved",
                attendance: s.attendance || 0,
                cgpa: s.cgpa || 0,
                backlogs: s.backlogs || 0,
                placed: s.placed || "Pending",
                companiesSelected: s.companiesSelected || 0
            };
        }));

        const result = await User.insertMany(formattedStudents, { ordered: false });
        res.status(201).json({ message: "Students imported successfully", count: result.length });
    } catch (err) {
        if (err.code === 11000) {
           res.status(207).json({ message: "Some students were imported, duplicates skipped.", count: err.insertedDocs?.length || 0 });
        } else {
           res.status(500).json({ message: err.message });
        }
    }
};

// Get all students
exports.getAllStudents = async (req, res) => {
    try {
        const query = { role: "student" };
        if (req.user.role === "faculty") {
            query.department = req.user.department;
        }
        const users = await User.find(query);
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Filter students
exports.filterStudents = async (req, res) => {
    try {
        const { batch, department, year, section } = req.query;
        const query = { role: "student" };
        if (batch) query.batch = batch;
        if (department) query.department = department;
        if (year) query.year = year;
        if (section) query.section = section;
        
        if (req.user.role === "faculty") {
            query.department = req.user.department;
        }

        const students = await User.find(query);
        res.json(students);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update student
exports.updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, personalEmail, password, batch, department, year, section, semester, phone, rollNo, attendance, cgpa, backlogs, placed, companiesSelected, status } = req.body;
        
        let updateData = { name, email, personalEmail, batch, department, year, section, semester, phone, rollNo, attendance, cgpa, backlogs, placed, companiesSelected, status };
        
        if (password && password.trim() !== "") {
          const hashedPassword = await bcrypt.hash(password, 10);
          updateData.password = hashedPassword;
        }

        const student = await User.findByIdAndUpdate(id, updateData, { new: true });
        if (!student) return res.status(404).json({ message: "Student not found" });
        
        res.json(student);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete student
exports.deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        res.json({ message: "Student deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// get student by id
exports.getStudentById = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await User.findById(id);
        if (!student) return res.status(404).json({ message: "Student not found" });
        res.json(student);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update self profile
exports.updateSelfProfile = async (req, res) => {
    try {
        const id = req.user.id || req.user._id;
        const { name, email, personalEmail, password, phone } = req.body;
        
        let updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (personalEmail !== undefined) updateData.personalEmail = personalEmail;
        if (phone) updateData.phone = phone;
        
        if (password && password.trim() !== "") {
          const hashedPassword = await bcrypt.hash(password, 10);
          updateData.password = hashedPassword;
        }

        const student = await User.findByIdAndUpdate(id, { $set: updateData }, { new: true });
        if (!student) return res.status(404).json({ message: "User not found" });
        
        res.json(student);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update student status (Approve/Reject)
exports.updateStudentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!["pending", "approved", "rejected"].includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const student = await User.findByIdAndUpdate(id, { status }, { new: true });
        if (!student) return res.status(404).json({ message: "Student not found" });
        
        res.json({ message: `Student marked as ${status}`, student });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
