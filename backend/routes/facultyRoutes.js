const router = require("express").Router();
const {
    addFaculty,
    getAllFaculty,
    updateFaculty,
    deleteFaculty
} = require("../controllers/facultyController");
const { auth, isAdmin } = require("../middleware/authMiddleware");

// 🧑‍🏫 ADMIN ROUTES FOR FACULTY MANAGEMENT
router.post("/add", auth, isAdmin, addFaculty);
router.get("/all", auth, isAdmin, getAllFaculty);
router.put("/:id", auth, isAdmin, updateFaculty);
router.delete("/:id", auth, isAdmin, deleteFaculty);

module.exports = router;
