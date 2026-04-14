const Document = require("../models/Document");
const User = require("../models/User");

// 📤 ADMIN: Upload Document for a student
exports.uploadDocument = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { documentType, fileUrl, status } = req.body;

        const student = await User.findById(studentId);
        if (!student) return res.status(404).json("Student not found");

        const doc = await Document.create({
            studentId,
            documentType,
            fileUrl,
            status: status || "Pending"
        });

        res.status(201).json(doc);
    } catch (err) {
        res.status(500).json(err.message);
    }
};

// Student view self documents
exports.getMyDocuments = async (req, res) => {
    try {
        const studentId = req.params.studentId || req.user.id;
        const docs = await Document.find({ studentId });
        res.json(docs);
    } catch (err) {
        res.status(500).json(err.message);
    }
};

// Admin view specific student documents
exports.getStudentDocuments = async (req, res) => {
    try {
        const { studentId } = req.params;
        const docs = await Document.find({ studentId }).populate("studentId", "name rollNo batch department");
        res.json(docs);
    } catch (err) {
        res.status(500).json(err.message);
    }
};

// ADMIN: VIEW ALL DOCUMENTS
exports.getAllDocuments = async (req, res) => {
    try {
        const docs = await Document.find().populate("studentId", "name rollNo batch department");
        res.json(docs);
    } catch (err) {
        res.status(500).json(err.message);
    }
};

// ADMIN: UPDATE DOCUMENT STATUS
exports.updateDocumentStatus = async (req, res) => {
    try {
        const { id } = req.params; // Using doc ID for specific verification
        const { status, reason } = req.body;

        const doc = await Document.findByIdAndUpdate(
            id,
            { status, rejectionReason: reason || "" },
            { new: true }
        );

        if (!doc) return res.status(404).json("Document not found");

        res.json({ message: `Document updated to ${status}`, doc });
    } catch (err) {
        res.status(500).json(err.message);
    }
};

// ADMIN: DELETE DOCUMENT
exports.deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;
        await Document.findByIdAndDelete(id);
        res.json("Document deleted successfully");
    } catch (err) {
        res.status(500).json(err.message);
    }
};

// ADMIN: EDIT DOCUMENT (Update Type, URL, or Status)
exports.editDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const { documentType, fileUrl, status } = req.body;
        const doc = await Document.findByIdAndUpdate(id, { documentType, fileUrl, status }, { new: true });
        res.json(doc);
    } catch (err) {
        res.status(500).json(err.message);
    }
};