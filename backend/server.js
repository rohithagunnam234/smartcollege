const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const feeRoutes = require("./routes/feeRoutes");
const documentRoutes = require("./routes/documentRoutes");
const noticeRoutes = require("./routes/noticeRoutes");
const messageRoutes = require("./routes/messageRoutes");
const studentRoutes = require("./routes/studentRoutes");
const facultyRoutes = require("./routes/facultyRoutes");
const academicRoutes = require("./routes/academicRoutes");
const placementRoutes = require("./routes/placementRoutes");
const jobRoutes = require("./routes/jobRoutes");
dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/fee", feeRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/academic", academicRoutes);
app.use("/api/placement", placementRoutes);
app.use("/api/jobs", jobRoutes);

app.get("/", (req, res) => {
    res.send("Smart College API Running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});