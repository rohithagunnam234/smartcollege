const router = require("express").Router();
const {
    getJobs,
    createJob,
    applyForJob,
    getApplications,
    updateApplicationStatus,
    toggleJobStatus
} = require("../controllers/jobController");
const { auth } = require("../middleware/authMiddleware");

router.get("/", auth, getJobs);
router.post("/", auth, createJob);
router.post("/:jobId/apply", auth, applyForJob);

router.get("/applications", auth, getApplications);
router.put("/applications/:id", auth, updateApplicationStatus);

router.put("/:id/toggle", auth, toggleJobStatus);

module.exports = router;
