const router = require("express").Router();
const {
    getPlacementRecords,
    updatePlacementRecord,
    getSelfPlacement
} = require("../controllers/placementController");
const { auth } = require("../middleware/authMiddleware");

// ADMIN ROUTES
router.get("/all", auth, getPlacementRecords);
router.put("/update/:id", auth, updatePlacementRecord);

// STUDENT ROUTE
router.get("/profile", auth, getSelfPlacement);

module.exports = router;
