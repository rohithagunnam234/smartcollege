const router = require("express").Router();
const {
    getAcademicRecords,
    updateAcademicRecord,
    getSelfAcademic
} = require("../controllers/academicController");
const { auth } = require("../middleware/authMiddleware");

// ADMIN ROUTES
router.get("/all", auth, getAcademicRecords);
router.put("/update/:id", auth, updateAcademicRecord);

// SHARED/STUDENT ROUTES
router.get("/profile", auth, getSelfAcademic);

module.exports = router;
