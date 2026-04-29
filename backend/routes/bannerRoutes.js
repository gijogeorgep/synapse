import express from "express";
import Banner from "../models/Banner.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @desc    Get all active banners
 * @route   GET /api/banners
 * @access  Public
 */
router.get("/", async (req, res) => {
    try {
        const banners = await Banner.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
        res.json(banners);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @desc    Get all banners (including inactive)
 * @route   GET /api/banners/admin
 * @access  Private/SuperAdmin
 */
router.get("/admin", protect, authorize("superadmin", "admin"), async (req, res) => {
    try {
        const banners = await Banner.find({}).sort({ order: 1, createdAt: -1 });
        res.json(banners);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @desc    Create a new banner
 * @route   POST /api/banners
 * @access  Private/SuperAdmin
 */
router.post("/", protect, authorize("superadmin"), async (req, res) => {
    const { title, desktopImageUrl, mobileImageUrl, linkUrl, isActive, order } = req.body;

    try {
        const banner = new Banner({
            title,
            desktopImageUrl,
            mobileImageUrl,
            linkUrl,
            isActive,
            order
        });

        const createdBanner = await banner.save();
        res.status(201).json(createdBanner);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

/**
 * @desc    Update a banner
 * @route   PATCH /api/banners/:id
 * @access  Private/SuperAdmin
 */
router.patch("/:id", protect, authorize("superadmin"), async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);

        if (banner) {
            banner.title = req.body.title || banner.title;
            banner.desktopImageUrl = req.body.desktopImageUrl || banner.desktopImageUrl;
            banner.mobileImageUrl = req.body.mobileImageUrl || banner.mobileImageUrl;
            banner.linkUrl = req.body.linkUrl || banner.linkUrl;
            banner.isActive = req.body.isActive !== undefined ? req.body.isActive : banner.isActive;
            banner.order = req.body.order !== undefined ? req.body.order : banner.order;

            const updatedBanner = await banner.save();
            res.json(updatedBanner);
        } else {
            res.status(404).json({ message: "Banner not found" });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

/**
 * @desc    Delete a banner
 * @route   DELETE /api/banners/:id
 * @access  Private/SuperAdmin
 */
router.delete("/:id", protect, authorize("superadmin"), async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);

        if (banner) {
            await banner.deleteOne();
            res.json({ message: "Banner removed" });
        } else {
            res.status(404).json({ message: "Banner not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
