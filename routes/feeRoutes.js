const router = require("express").Router();
const {
    assignFee,
    getMyFee,
    getStudentFee,
    getAllFees,
    updateFee,
    deleteFee
} = require("../controllers/feeController");

const { auth, isAdmin } = require("../middleware/authMiddleware");

// 🧑‍💼 ADMIN ROUTES
router.post("/assign", auth, isAdmin, assignFee);
router.get("/all", auth, isAdmin, getAllFees);
router.get("/student/:studentId", auth, isAdmin, getStudentFee);
router.put("/update/:id", auth, isAdmin, updateFee);
router.delete("/delete/:id", auth, isAdmin, deleteFee);

// 🎓 STUDENT ROUTE
router.get("/my/:studentId", auth, getMyFee);

module.exports = router;