import express from 'express';
import { uploadImage, uploadFile } from '../middleware/uploadMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

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
    res.json({
        message: "File uploaded successfully",
        url: req.file.path, // Cloudinary URL
        public_id: req.file.filename
    });
});

export default router;
