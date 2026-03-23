import express from "express";
import {
    createBlog,
    getBlogs,
    getBlogByIdOrSlug,
    updateBlog,
    deleteBlog,
} from "../controllers/blogController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getBlogs);
router.get("/:idOrSlug", getBlogByIdOrSlug);

// Protected routes (Admin & Superadmin only)
router.post("/", protect, authorize("admin", "superadmin"), createBlog);
router.put("/:id", protect, authorize("admin", "superadmin"), updateBlog);
router.delete("/:id", protect, authorize("admin", "superadmin"), deleteBlog);

export default router;
