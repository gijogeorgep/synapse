import Classroom from "../models/Classroom.js";
import User from "../models/User.js";
import StudyMaterial from "../models/StudyMaterial.js";
import { Subscription } from "../models/Financial.js";
import cloudinary from "../config/cloudinary.js";
import { sendStudyMaterialEmail } from "../utils/emailService.js";

// @desc    Upload study material
// @route   POST /api/materials
// @access  Private (Teacher/Admin)
export const uploadMaterial = async (req, res) => {
    const { title, description, fileType, fileUrl, subject, isPaid, price, classroom, category } = req.body;

    try {
        const material = await StudyMaterial.create({
            title,
            description,
            fileType,
            fileUrl,
            subject,
            classroom: classroom || null,
            category: category || "study_material",
            isPaid,
            price: isPaid ? price : 0,
            uploadedBy: req.user._id,
        });

        let studentEmails = [];
        let classroomName = 'Global / All Students';

        if (classroom) {
            const classroomData = await Classroom.findById(classroom).populate("students", "email");
            if (classroomData && classroomData.students && classroomData.students.length > 0) {
                studentEmails = classroomData.students.map(s => s.email);
                classroomName = classroomData.name;
            }
        } else {
            const allStudents = await User.find({ role: "student" }).select("email");
            studentEmails = allStudents.map(s => s.email);
        }

        if (studentEmails.length > 0) {
            sendStudyMaterialEmail(studentEmails, title, classroomName, category || "study_material");
        }

        res.status(201).json(material);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all materials
// @route   GET /api/materials
// @access  Public (Basic info), Private (Access control)
export const getMaterials = async (req, res) => {
    try {
        let query = {};
        
        // Safety check for req.user
        if (!req.user) {
            console.warn("[GET_MATERIALS] Warning: req.user is undefined despite protect middleware.");
            return res.status(401).json({ message: "Not authorized, user data missing" });
        }

        // Filtering for Students
        if (req.user.role === 'student') {
            const studentClassrooms = await Classroom.find({ students: req.user._id }).select("_id");
            const classroomIdsFromStudents = (studentClassrooms || []).map((c) => c._id?.toString()).filter(Boolean);
            
            const enrolledClassrooms = Array.isArray(req.user.enrolledClassrooms)
                ? req.user.enrolledClassrooms.map((id) => {
                    if (!id) return null;
                    return (id?._id || id)?.toString();
                  }).filter(Boolean)
                : [];
                
            const classroomIdSet = new Set([...classroomIdsFromStudents, ...enrolledClassrooms]);
            const classroomIds = Array.from(classroomIdSet);

            console.log(`[GET_MATERIALS] Student ${req.user.email} (ID: ${req.user._id}) filtering for classrooms:`, classroomIds);

            // Always include global materials (null classroom) plus classroom-specific materials
            const orClauses = [
                { classroom: null },
                { classroom: { $exists: false } }
            ];

            if (classroomIds.length > 0) {
                orClauses.unshift({ classroom: { $in: classroomIds } });
            }

            query.$or = orClauses;
        }

        console.log(`[GET_MATERIALS] Final Query:`, JSON.stringify(query, null, 2));

        const materials = await StudyMaterial.find(query);
        console.log(`[GET_MATERIALS] Found ${materials.length} materials for ${req.user.email}`);
        if (materials.length > 0) {
            console.log("[GET_MATERIALS] Sample titles:", materials.slice(0, 3).map(m => m.title));
        }
        res.json(materials);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get material by ID with access control
// @route   GET /api/materials/:id
// @access  Private
export const getMaterialById = async (req, res) => {
    try {
        const material = await StudyMaterial.findById(req.params.id);

        if (!material) {
            return res.status(404).json({ message: "Material not found" });
        }

        // Access control logic
        if (material.isPaid) {
            // Check if user has active subscription for this material or full-access
            const hasSubscription = await Subscription.findOne({
                student: req.user._id,
                $or: [
                    { material: material._id, status: "active" },
                    { type: "full-access", status: "active" }
                ]
            });

            if (!hasSubscription && req.user.role === "student") {
                return res.status(403).json({ message: "Payment required to access this material" });
            }
        }

        res.json(material);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    View material via proxy (fixes Cloudinary MIME issues)
// @route   GET /api/materials/view/:id
export const viewMaterialProxy = async (req, res) => {
    const { id } = req.params;
    console.log(`[VIEW_PROXY] Request received for ID: ${id}`);

    try {
        // Validate ObjectID format to prevent internal errors
        if (id && id.length !== 24) {
            console.warn(`[VIEW_PROXY] Invalid ID format: ${id}`);
            return res.status(400).json({ message: "Invalid material ID format" });
        }

        const material = await StudyMaterial.findById(id);
        if (!material) {
            console.warn(`[VIEW_PROXY] Material not found in DB for ID: ${id}`);
            return res.status(404).json({ message: "Material not found" });
        }

        console.log(`[VIEW_PROXY] Found material: "${material.title}" (Paid: ${material.isPaid})`);

        // Access control: Check if paid and if user has access
        if (material.isPaid && req.user && req.user.role === "student") {
            const hasSubscription = await Subscription.findOne({
                student: req.user._id,
                $or: [
                    { material: material._id, status: "active" },
                    { type: "full-access", status: "active" }
                ]
            });

            if (!hasSubscription) {
                console.warn(`[VIEW_PROXY] Access denied for student ${req.user.email} (No subscription)`);
                return res.status(403).json({ message: "Payment required to access this material" });
            }
        }


        let publicId = material.public_id;
        
        // Fallback: Extract public_id from fileUrl if missing (for old uploads)
        if (!publicId && material.fileUrl) {
            const parts = material.fileUrl.split('/');
            const uploadIndex = parts.indexOf('upload');
            if (uploadIndex !== -1) {
                // public_id is everything after the version (v12345...)
                publicId = parts.slice(uploadIndex + 2).join('/').split('.')[0];
            }
        }

        // Guess resource_type from URL if possible (fallback for older uploads)
        let resourceType = material.fileType === 'pdf' ? 'image' : 'raw';
        if (material.fileUrl && material.fileUrl.includes('/raw/')) {
            resourceType = 'raw';
        } else if (material.fileUrl && material.fileUrl.includes('/image/')) {
            resourceType = 'image';
        }

        // Generate a signed URL. If we still don't have a publicId, use the fileUrl directly as fallback.
        const secureUrl = cloudinary.url(publicId || material.fileUrl, {
            resource_type: resourceType,
            sign_url: true,
            secure: true
        });

        console.log(`[VIEW_PROXY] Proxying view for: ${material.title} -> ${secureUrl}`);

        const response = await fetch(secureUrl);
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[VIEW_PROXY] Cloudinary fetch failed (${response.status}):`, errorText);
            throw new Error(`Cloudinary responded with ${response.status}`);
        }

        const isPdf = material.fileType === 'pdf';
        const contentType = isPdf ? 'application/pdf' : (response.headers.get('content-type') || 'image/jpeg');
        // Content headers will be set in the if/else block below
        
        if (req.query.download === 'true') {
            const extension = isPdf ? 'pdf' : (contentType.split('/')[1] || 'bin');
            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Disposition', `attachment; filename="${material.title || 'document'}.${extension}"`);
        } else {
            // Force inline headers to ensure browser previewing
            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Disposition', 'inline');
            res.setHeader('X-Content-Type-Options', 'nosniff');
        }
        
        const arrayBuffer = await response.arrayBuffer();
        res.send(Buffer.from(arrayBuffer));
    } catch (error) {
        console.error("[VIEW_PROXY] Proxy error:", error);
        res.status(500).json({ 
            message: "Error viewing document", 
            details: process.env.NODE_ENV === 'development' ? error.message : undefined 
        });
    }
};
