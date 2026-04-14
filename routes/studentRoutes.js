const router = require("express").Router();

const {
    addStudent,
    getAllStudents,
    filterStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    updateSelfProfile,
    addBulkStudents,
    updateStudentStatus
} = require("../controllers/studentController");

const { auth, isAdmin } = require("../middleware/authMiddleware");

// 🧑‍💼 ADMIN ROUTES
router.post("/add", auth, isAdmin, addStudent);
router.post("/bulk", auth, isAdmin, addBulkStudents);
router.get("/all", auth, getAllStudents);
router.get("/filter", auth, filterStudents);
router.get("/:id", auth, getStudentById);
router.put("/update-profile", auth, updateSelfProfile);
router.put("/:id", auth, isAdmin, updateStudent);
router.put("/:id/status", auth, isAdmin, updateStudentStatus);
router.delete("/:id", auth, isAdmin, deleteStudent);

module.exports = router;