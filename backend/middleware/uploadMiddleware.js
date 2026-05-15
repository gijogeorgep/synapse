import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

// Image Storage Configuration
const imageStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'synapse/images',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    },
});

// PDF/File Storage Configuration
const fileStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: (req, file) => {
        const originalName = (file?.originalname || "").toLowerCase();
        const ext = originalName.includes(".") ? originalName.split(".").pop() : "";

        const params = {
            folder: 'synapse/documents',
            resource_type: 'raw', // Store non-images as raw
            allowed_formats: ['pdf', 'ppt', 'pptx', 'doc', 'docx', 'xls', 'xlsx', 'txt'],
        };

        // If it's an Office document, request Cloudinary to store a PDF rendition.
        // (If the account doesn't support conversion, the API will still return the original URL.)
        if (ext && ext !== 'pdf') params.format = 'pdf';

        return params;
    },
});

const uploadImage = multer({ storage: imageStorage });
const uploadFile = multer({ storage: fileStorage });

export { uploadImage, uploadFile };
