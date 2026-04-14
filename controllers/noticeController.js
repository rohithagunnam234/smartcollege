const Notice = require("../models/Notice");
const User = require("../models/User");

//Create Notice (Admin)
exports.createNotice = async (req, res) => {
    try {
        const { title, message, department, year } = req.body;

        const notice = await Notice.create({
            title,
            message,
            department,
            year,
            createdBy: req.user.id
        });

        res.status(201).json(notice);
    } catch (err) {
        res.status(500).json(err.message);
    }
};

//student get relevant notices (Self or By ID)
exports.getMyNotices = async (req, res) => {
    try {
        const studentId = req.params.studentId || req.user.id;
        const student = await User.findById(studentId);

        if (!student) return res.status(404).json("Student not found");

        const { department, year } = student;
        console.log(`Searching notices for: Dept=${department}, Year=${year}`);

        const notices = await Notice.find({
            $or: [
                { department: "All" },
                { year: "All" },
                { department, year }
            ]
        }).sort({ createdAt: -1 });

        console.log(`Found ${notices.length} notices`);
        res.json(notices);
    } catch (err) {
        res.status(500).json(err.message);
    }
};

//Get All Notices (Admin)
exports.getAllNotices = async (req, res) => {
    try {
        const notices = await Notice.find().populate("createdBy", "name");
        res.json(notices);
    } catch (err) {
        res.status(500).json(err.message);
    }
};

//Delete Notice (Admin)
exports.deleteNotice = async (req, res) => {
    try {
        const { id } = req.params;

        const notice = await Notice.findById(id);
        if (!notice) return res.status(404).json("Notice not found");

        await notice.deleteOne();
        res.json("Notice deleted");
    } catch (err) {
        res.status(500).json(err.message);
    }
};

//Update Notice (Admin)
exports.updateNotice = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, message, department, year } = req.body;
        const notice = await Notice.findByIdAndUpdate(id, { title, message, department, year }, { new: true });
        res.json(notice);
    } catch (err) {
        res.status(500).json(err.message);
    }
};