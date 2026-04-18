import express from "express";
import {
    uploadMaterial,
    getMaterials,
    getMaterialById,
    viewMaterialProxy,
} from "../controllers/materialController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getMaterials);
router.get("/view/:id", protect, viewMaterialProxy);
router.get("/view/:id/:filename", protect, viewMaterialProxy); // suffix support for better previewing
router.get("/:id", protect, getMaterialById);
router.post("/", protect, authorize("teacher", "admin", "superadmin"), uploadMaterial);

export default router;
