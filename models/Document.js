const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        documentType: {
            type: String,
            enum: ["ID_PROOF", "MARKS_MEMO", "TC", "OTHER"],
            required: true
        },

        fileUrl: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: ["Pending", "Verified", "Rejected"],
            default: "Pending"
        },

        uploadedAt: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Document", documentSchema);