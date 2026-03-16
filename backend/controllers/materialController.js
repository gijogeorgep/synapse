import { Subscription } from "../models/Financial.js";
import Classroom from "../models/Classroom.js";
import User from "../models/User.js";

// @desc    Upload study material
// @route   POST /api/materials
// @access  Private (Teacher/Admin)
export const uploadMaterial = async (req, res) => {
    const { title, description, fileType, fileUrl, subject, isPaid, price } = req.body;

    try {
        const material = await StudyMaterial.create({
            title,
            description,
            fileType,
            fileUrl,
            subject,
            isPaid,
            price: isPaid ? price : 0,
            uploadedBy: req.user._id,
        });

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
        
        // Filtering for Institutional Students
        if (req.user && req.user.role === 'student' && req.user.userType === 'institutional') {
            const studentClassrooms = await Classroom.find({ students: req.user._id });
            const subjects = studentClassrooms.flatMap(c => c.subjects);
            
            // Only show materials for subjects they are enrolled in
            if (subjects.length > 0) {
                query.subject = { $in: subjects };
            }
        }

        const materials = await StudyMaterial.find(query);
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
