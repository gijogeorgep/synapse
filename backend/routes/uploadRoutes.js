import express from 'express';
import { uploadImage, uploadFile } from '../middleware/uploadMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';
import cloudinary from '../config/cloudinary.js';

const router = express.Router();

// @desc    Upload an image
// @route   POST /api/upload/image
// @access  Private
router.post('/image', protect, uploadImage.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No image file uploaded" });
    }
    res.json({
        message: "Image uploaded successfully",
        url: req.file.path, // Cloudinary URL
        public_id: req.file.filename
    });
});

// @desc    Upload a file (PDF)
// @route   POST /api/upload/file
// @access  Private
router.post('/file', protect, uploadFile.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No PDF file uploaded" });
    }

    const originalName = (req.file.originalname || "").toLowerCase();
    const ext = originalName.includes(".") ? originalName.split(".").pop() : "";

    const originalUrl = req.file.path; // Cloudinary URL to the stored asset
    const publicId = req.file.filename;

    // Prefer a PDF URL for office docs so the frontend can iframe-preview consistently.
    // Cloudinary will generate/deliver a PDF rendition when supported.
    const pdfUrl = ext && ext !== "pdf"
        ? cloudinary.url(publicId, { resource_type: "raw", format: "pdf", secure: true })
        : originalUrl;

    res.json({
        message: "File uploaded successfully",
        url: pdfUrl,
        original_url: originalUrl,
        public_id: publicId
    });
});

export default router;
