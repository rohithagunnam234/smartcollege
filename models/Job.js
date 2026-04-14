const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    description: { type: String },
    location: { type: String },
    package: { type: String },
    minCgpa: { type: Number, default: 0 },
    eligibleDepts: { type: [String], default: [] },
    jobType: { type: String, default: 'Full-time' },
    driveDate: { type: Date },
    deadline: { type: Date, required: true },
    status: { type: String, enum: ["open", "closed"], default: "open" }
}, { timestamps: true });

module.exports = mongoose.model("Job", jobSchema);
