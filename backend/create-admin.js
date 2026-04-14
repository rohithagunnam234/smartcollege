const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const path = require("path");

// Load backend models and env
dotenv.config({ path: path.join(__dirname, ".env") });
const User = require("./models/User");

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB Atlas...");

        const email = "admin@college.com";
        const password = "123456";

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email });
        if (existingAdmin) {
            console.log("Admin user already exists!");
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = new User({
            name: "Main Admin",
            email: email,
            password: hashedPassword,
            role: "admin",
            status: "approved"
        });

        await admin.save();
        console.log("Admin account created successfully!");
        console.log("Email: " + email);
        console.log("Password: " + password);

        process.exit(0);
    } catch (err) {
        console.error("Error creating admin:", err.message);
        process.exit(1);
    }
};

createAdmin();
