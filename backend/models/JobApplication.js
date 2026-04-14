const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["Pending", "Selected", "Rejected"], default: "Pending" }
}, { timestamps: true });

// Prevent multiple applications by the same student for the same job
applicationSchema.index({ job: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("JobApplication", applicationSchema);
