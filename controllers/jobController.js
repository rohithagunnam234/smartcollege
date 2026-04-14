const Job = require("../models/Job");
const JobApplication = require("../models/JobApplication");
const User = require("../models/User");

// 1. Get all jobs (Faculty sees all, Students see open ones unless they applied)
exports.getJobs = async (req, res) => {
    try {
        const jobs = await Job.find().sort({ createdAt: -1 });
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 2. Create Job (Faculty only)
exports.createJob = async (req, res) => {
    try {
        if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Not authorized" });
        }
        const job = await Job.create(req.body);
        res.status(201).json(job);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 3. Apply for Job (Student only)
exports.applyForJob = async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ message: "Only students can apply" });
        }
        
        // Ensure student is in 4th year
        const student = await User.findById(req.user.id || req.user._id);
        if (student.year !== "4") {
            return res.status(403).json({ message: "Only 4th year students can apply" });
        }

        const { jobId } = req.params;
        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ message: "Job not found" });
        if (job.status !== "open") return res.status(400).json({ message: "Job is closed" });

        // Check CGPA Eligibility
        if (job.minCgpa && student.cgpa < job.minCgpa) {
            return res.status(403).json({ message: `Minimum CGPA required is ${job.minCgpa}` });
        }

        // Check Dept Eligibility
        if (job.eligibleDepts && job.eligibleDepts.length > 0) {
            if (!job.eligibleDepts.includes(student.department)) {
                return res.status(403).json({ message: `This job is only for ${job.eligibleDepts.join(', ')} departments` });
            }
        }

        const application = await JobApplication.create({
            job: jobId,
            student: student._id
        });
        
        res.status(201).json(application);
    } catch (err) {
        if (err.code === 11000) {
            res.status(400).json({ message: "You have already applied for this job" });
        } else {
            res.status(500).json({ message: err.message });
        }
    }
};

// 4. Get Applications
exports.getApplications = async (req, res) => {
    try {
        if (req.user.role === 'student') {
            const applications = await JobApplication.find({ student: req.user.id || req.user._id })
                                                     .populate("job");
            return res.json(applications);
        } else {
            // Faculty/Admin views all applications
            const queries = {};
            if (req.query.jobId) queries.job = req.query.jobId;

            const applications = await JobApplication.find(queries)
                                                     .populate("job")
                                                     .populate("student", "name rollNo email department batch year");
            res.json(applications);
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 5. Update Application Status (Faculty only)
exports.updateApplicationStatus = async (req, res) => {
    try {
        if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Not authorized" });
        }
        
        const { id } = req.params;
        const { status } = req.body;
        
        if (!["Pending", "Selected", "Rejected"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const application = await JobApplication.findByIdAndUpdate(id, { status }, { new: true })
                                                .populate("job")
                                                .populate("student", "name rollNo email department");
        if (!application) return res.status(404).json({ message: "Application not found" });

        // Update student placed status if selected
        if (status === "Selected") {
            await User.findByIdAndUpdate(application.student._id, { placed: "Yes", $inc: { companiesSelected: 1 } });
        }

        res.json(application);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 6. Delete/Toggle Job
exports.toggleJobStatus = async (req, res) => {
    try {
        if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Not authorized" });
        }
        
        const { id } = req.params;
        const job = await Job.findById(id);
        if (!job) return res.status(404).json({ message: "Job not found" });

        job.status = job.status === "open" ? "closed" : "open";
        await job.save();

        res.json(job);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
