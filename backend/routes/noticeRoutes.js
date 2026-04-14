const router = require("express").Router();

const {
    createNotice,
    getMyNotices,
    getAllNotices,
    deleteNotice,
    updateNotice
} = require("../controllers/noticeController");

const { auth, isAdmin } = require("../middleware/authMiddleware");

// 🧑‍💼 ADMIN ROUTES
router.post("/create", auth, isAdmin, createNotice);
router.get("/all", auth, getAllNotices);
router.delete("/:id", auth, isAdmin, deleteNotice);
router.put("/:id", auth, isAdmin, updateNotice);

// 🎓 STUDENT ROUTE
router.get("/my/:studentId", auth, getMyNotices);

module.exports = router;