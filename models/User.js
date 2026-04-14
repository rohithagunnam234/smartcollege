const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        email: {
            type: String,
            unique: true,
            required: true
        },

        personalEmail: {
            type: String,
            required: function () {
                return this.role === "student";
            }
        },

        rollNo: {
            type: String,
            unique: true,
            sparse: true,
            required: function () {
                return this.role === "student";
            }
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ["admin", "student", "faculty"],
            default: "student"
        },

        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: function() { return this.role === 'admin' ? 'approved' : 'pending'; }
        },

        batch: {
            type: String,
            required: function () {
                return this.role === "student";
            }
        },

        department: {
            type: String,
            required: function () {
                return this.role === "student";
            }
        },

        year: {
            type: String,
            required: function () {
                return this.role === "student";
            }
        },

        section: {
            type: String,
            required: function () {
                return this.role === "student";
            }
        },

        semester: {
            type: String,
            required: function () {
                return this.role === "student";
            }
        },
        
        phone: {
            type: String,
            required: function () {
                return this.role === "student";
            }
        },

        admissionDate: {
            type: Date,
            default: Date.now
        },

        // Academic Module
        attendance: {
            type: Number,
            default: 0
        },
        cgpa: {
            type: Number,
            default: 0
        },
        backlogs: {
            type: Number,
            default: 0
        },

        // Placement Module
        placed: {
            type: String,
            enum: ["Yes", "No", "Pending"],
            default: "Pending"
        },
        companiesSelected: {
            type: Number,
            default: 0
        },
        selectedCompanies: {
            type: String,
            default: ""
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);