import express from "express"; // Restart triggered
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import materialRoutes from "./routes/materialRoutes.js";
import examRoutes from "./routes/examRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import classroomRoutes from "./routes/classroomRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import programRoutes from "./routes/programRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import sitemapRoutes from "./routes/sitemapRoutes.js";

dotenv.config();

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
}));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/classrooms", classroomRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/programs", programRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/sitemap", sitemapRoutes);
app.use("/", sitemapRoutes); // Allow /sitemap.xml at root level

app.get("/", (req, res) => {
    res.send("API is running...");
});

// Global error handler — must have 4 arguments for Express to treat it as error middleware
app.use((err, req, res, next) => {
    // body-parser JSON parse failure (malformed request body)
    if (err.type === "entity.parse.failed" || err instanceof SyntaxError) {
        return res.status(400).json({
            message: "Invalid JSON in request body. Please send a properly formatted JSON object.",
        });
    }
    console.error("Unhandled server error:", err);
    res.status(500).json({ message: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
