import express from "express";
import {
    uploadMaterial,
    getMaterials,
    getMaterialById,
} from "../controllers/materialController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getMaterials);
router.get("/:id", protect, getMaterialById);
router.post("/", protect, authorize("teacher", "admin"), uploadMaterial);

export default router;
