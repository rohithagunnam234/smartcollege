const router = require("express").Router();
const {
    sendMessage,
    replyMessage,
    getConversation,
    getAdminConversations,
    markAsRead,
    editMessage,
    deleteMessage
} = require("../controllers/messageController");

const { auth } = require("../middleware/authMiddleware");

// Student
router.post("/send", auth, sendMessage);
router.get("/conversation/:studentId", auth, getConversation);
// Admin
router.post("/reply", auth, replyMessage);
router.get("/conversations", auth, getAdminConversations);
// Common
router.put("/read/:id", auth, markAsRead);
router.put("/:id", auth, editMessage);
router.delete("/:id", auth, deleteMessage);

module.exports = router;