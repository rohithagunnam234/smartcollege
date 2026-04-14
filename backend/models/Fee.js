const mongoose = require("mongoose");

const feeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    totalFee: {
      type: Number,
      required: true
    },

    paidFee: {
      type: Number,
      default: 0
    },

    dueFee: {
      type: Number,
      default: 0
    },

    status: {
      type: String,
      enum: ["Paid", "Pending", "Partial"],
      default: "Pending"
    },

    feeType: {
      type: String,
      default: "Academic",
      enum: ["Academic", "Transport", "Hostel", "Semester", "Examination", "Other"]
    },

    academicYear: String,
    
    paidDate: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Fee", feeSchema);