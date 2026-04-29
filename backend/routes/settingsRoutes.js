import express from "express";
import GlobalSettings from "../models/GlobalSettings.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @desc    Get global settings
 * @route   GET /api/settings
 * @access  Public
 */
router.get("/", async (req, res) => {
    try {
        let settings = await GlobalSettings.findOne();
        if (!settings) {
            settings = await GlobalSettings.create({ showBanners: true });
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @desc    Update global settings
 * @route   PATCH /api/settings
 * @access  Private/Admin
 */
router.patch("/", protect, authorize("superadmin", "admin"), async (req, res) => {
    try {
        let settings = await GlobalSettings.findOne();
        if (!settings) {
            settings = new GlobalSettings();
        }
        
        if (req.body.showBanners !== undefined) {
            settings.showBanners = req.body.showBanners;
        }

        const updatedSettings = await settings.save();
        res.json(updatedSettings);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
