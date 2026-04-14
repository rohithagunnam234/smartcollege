const router = require("express").Router();
const {
    uploadDocument,
    getMyDocuments,
    getStudentDocuments,
    getAllDocuments,
    updateDocumentStatus,
    deleteDocument,
    editDocument
} = require("../controllers/documentController");

const { auth, isAdmin } = require("../middleware/authMiddleware");

// 🎓 Student Routes (Self)
router.get("/my", auth, getMyDocuments);
router.get("/my/:studentId", auth, getMyDocuments);

// 🧑‍💼 Admin Routes
router.post("/upload/:studentId", auth, isAdmin, uploadDocument);
router.get("/student/:studentId", auth, isAdmin, getStudentDocuments);
router.get("/all", auth, isAdmin, getAllDocuments);
router.put("/status/:id", auth, isAdmin, updateDocumentStatus);
router.put("/edit/:id", auth, isAdmin, editDocument);
router.delete("/delete/:id", auth, isAdmin, deleteDocument);

module.exports = router;