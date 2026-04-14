const Message = require("../models/Message");
const User = require("../models/User");

// 📤 Send message (Student → Admin)
exports.sendMessage = async (req, res) => {
    try {
        const senderId = req.user.id;
        const { message } = req.body;

        const admin = await User.findOne({ role: "admin" });
        if (!admin) return res.status(404).json("Admin not found");

        const msg = await Message.create({
            senderId,
            receiverId: admin._id,
            message
        });

        res.status(201).json(msg);
    } catch (err) {
        res.status(500).json(err.message);
    }
};

// Admin reply to student
exports.replyMessage = async (req, res) => {
    try {
        const adminId = req.user.id;
        const { studentId, message } = req.body;

        const msg = await Message.create({
            senderId: adminId,
            receiverId: studentId,
            message
        });

        res.status(201).json(msg);
    } catch (err) {
        res.status(500).json(err.message);
    }
};

// 📥 Get all messages for a specific student conversation (Admin or Student)
exports.getConversation = async (req, res) => {
    try {
        const { studentId } = req.params;
        const admin = await User.findOne({ role: "admin" });
        if (!admin) return res.status(404).json("Admin not found");

        const messages = await Message.find({
            $or: [
                { senderId: studentId, receiverId: admin._id },
                { senderId: admin._id, receiverId: studentId }
            ]
        })
        .populate("senderId", "name rollNo")
        .sort({ createdAt: 1 });

        res.json(messages);
    } catch (err) {
        res.status(500).json(err.message);
    }
};

// Get list of students who have messages (Admin View)
exports.getAdminConversations = async (req, res) => {
    try {
        const admin = await User.findOne({ role: "admin" });
        if (!admin) return res.status(404).json("Admin not found");

        // Find unique student IDs from messages where admin is involved
        const messages = await Message.find({
            $or: [{ receiverId: admin._id }, { senderId: admin._id }]
        }).sort({ createdAt: -1 });

        const studentIds = [...new Set(messages.map(m => 
            m.senderId.toString() === admin._id.toString() ? m.receiverId.toString() : m.senderId.toString()
        ))];

        const conversations = await Promise.all(studentIds.map(async (sid) => {
            const student = await User.findById(sid).select("name rollNo department");
            const lastMsg = await Message.findOne({
                $or: [
                    { senderId: sid, receiverId: admin._id },
                    { senderId: admin._id, receiverId: sid }
                ]
            }).sort({ createdAt: -1 });

            return {
                student,
                lastMessage: lastMsg?.message,
                time: lastMsg?.createdAt,
                id: sid
            };
        }));

        res.json(conversations);
    } catch (err) {
        res.status(500).json(err.message);
    }
};

//mark as read
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        await Message.findByIdAndUpdate(id, { isRead: true });
        res.json("Message marked as read");
    } catch (err) {
        res.status(500).json(err.message);
    }
};

// Edit message (Only sender)
exports.editMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { message } = req.body;
        
        const msg = await Message.findById(id);
        if (!msg) return res.status(404).json("Message not found");

        if (msg.senderId.toString() !== req.user.id) {
            return res.status(403).json("Only the sender can edit this message");
        }

        msg.message = message;
        await msg.save();
        res.json(msg);
    } catch (err) {
        res.status(500).json(err.message);
    }
};

// Delete message (Only sender)
exports.deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        
        const msg = await Message.findById(id);
        if (!msg) return res.status(404).json("Message not found");

        if (msg.senderId.toString() !== req.user.id) {
            return res.status(403).json("Only the sender can delete this message");
        }

        await Message.findByIdAndDelete(id);
        res.json("Message deleted");
    } catch (err) {
        res.status(500).json(err.message);
    }
};