import express from "express";
import {
    getPrograms,
    getProgramById,
    getAdminPrograms,
    createProgram,
    updateProgram,
    deleteProgram
} from "../controllers/programController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

const adminOnly = [protect, authorize("admin", "superadmin")];

// Public routes
router.get("/", getPrograms);

// Protected admin-only routes (must come BEFORE /:id to avoid route conflict)
router.get("/admin", ...adminOnly, getAdminPrograms);
router.post("/", ...adminOnly, createProgram);

// Public single program route
router.get("/:id", getProgramById);

// Protected single program mutation routes
router.patch("/:id", ...adminOnly, updateProgram);
router.delete("/:id", ...adminOnly, deleteProgram);

export default router;
