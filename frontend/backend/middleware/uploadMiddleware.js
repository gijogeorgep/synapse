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
    params: {
        folder: 'synapse/documents',
        resource_type: 'raw', // Important for non-image files like PDF
        format: 'pdf',
    },
});

const uploadImage = multer({ storage: imageStorage });
const uploadFile = multer({ storage: fileStorage });

export { uploadImage, uploadFile };
