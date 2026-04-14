const Fee = require("../models/Fee");
const User = require("../models/User");


// ➕ ADMIN: Assign fee to student
exports.assignFee = async (req, res) => {
    try {
        const { studentId, totalFee, paidFee = 0, academicYear, feeType = "Academic" } = req.body;

        if (Number(paidFee) > Number(totalFee)) {
            return res.status(400).json({ message: "Paid fee cannot be more than total fee" });
        }

        const dueFee = totalFee - paidFee;

        let status = "Pending";
        if (dueFee === 0) status = "Paid";
        else if (paidFee > 0) status = "Partial";

        const fee = await Fee.create({
            studentId,
            totalFee,
            paidFee,
            dueFee,
            status,
            academicYear,
            feeType,
            paidDate: paidFee > 0 ? new Date() : null
        });

        res.status(201).json(fee);
    } catch (err) {
        res.status(500).json(err.message);
    }
};
//student view (Self or By ID) - Returns all academic years
exports.getMyFee = async (req, res) => {
    try {
        const studentId = req.params.studentId || req.user.id;
        const fees = await Fee.find({ studentId }).populate("studentId").sort({ createdAt: -1 });
        if (!fees || fees.length === 0) return res.status(404).json("Fee not assigned yet");
        res.json(fees);
    } catch (err) {
        res.status(500).json(err.message);
    }
};

//Admin view specific student fee
exports.getStudentFee = async (req, res) => {
    try {
        const { studentId } = req.params;
        const fee = await Fee.findOne({ studentId }).populate("studentId");
        if (!fee) return res.status(404).json("Fee not assigned for this student");
        res.json(fee);
    } catch (err) {
        res.status(500).json(err.message);
    }
};
//admin view
exports.getAllFees = async (req, res) => {
    try {
        const fees = await Fee.find().populate("studentId");
        res.json(fees);
    } catch (err) {
        res.status(500).json(err.message);
    }
};
//admin update fee by Record ID
exports.updateFee = async (req, res) => {
    try {
        const { id } = req.params;
        const { totalFee, paidFee, academicYear, feeType } = req.body;

        const fee = await Fee.findById(id);
        if (!fee) return res.status(404).json("Fee record not found");

        const newTotalFee = totalFee !== undefined ? Number(totalFee) : fee.totalFee;
        const amountToAdd = paidFee !== undefined && Number(paidFee) > 0 ? Number(paidFee) : 0;
        const newPaidFee = fee.paidFee + amountToAdd;

        if (newPaidFee > newTotalFee) {
            return res.status(400).json({ message: "Total paid amount cannot exceed total fee amount" });
        }

        fee.totalFee = newTotalFee;
        if (amountToAdd > 0) {
            fee.paidDate = new Date();
            fee.paidFee = newPaidFee;
        }

        if (academicYear) fee.academicYear = academicYear;
        if (feeType) fee.feeType = feeType;

        fee.dueFee = fee.totalFee - fee.paidFee;

        if (fee.dueFee <= 0) {
            fee.status = "Paid";
            fee.dueFee = 0;
        } else if (fee.paidFee > 0) {
            fee.status = "Partial";
        } else {
            fee.status = "Pending";
        }

        await fee.save();
        res.json(fee);
    } catch (err) {
        res.status(500).json(err.message);
    }
};

// Admin delete fee record
exports.deleteFee = async (req, res) => {
    try {
        const { id } = req.params;
        await Fee.findByIdAndDelete(id);
        res.json("Fee record deleted successfully");
    } catch (err) {
        res.status(500).json(err.message);
    }
};
