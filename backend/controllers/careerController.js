import Vacancy from "../models/Vacancy.js";
import CareerApplication from "../models/CareerApplication.js";
import cloudinary from "../config/cloudinary.js";

// ==========================================
// PUBLIC CONTROLLERS
// ==========================================

// @desc    Get all active vacancies
// @route   GET /api/careers/vacancies
// @access  Public
export const getPublicVacancies = async (req, res) => {
    try {
        const vacancies = await Vacancy.find({ isActive: true }).sort({ createdAt: -1 });
        res.status(200).json(vacancies);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get active vacancy by ID
// @route   GET /api/careers/vacancies/:id
// @access  Public
export const getPublicVacancyById = async (req, res) => {
    try {
        const vacancy = await Vacancy.findOne({ _id: req.params.id, isActive: true });
        if (!vacancy) {
            return res.status(404).json({ message: "Vacancy not found or is no longer active." });
        }
        res.status(200).json(vacancy);
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(404).json({ message: "Vacancy not found or is no longer active." });
        }
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Submit a career application with CV upload
// @route   POST /api/careers/apply
// @access  Public
export const submitApplication = async (req, res) => {
    try {
        const { name, email, phoneNumber, appliedVacancy, generalRole, experience, coverLetter, subject, classLevel } = req.body;

        if (!name || !email || !phoneNumber) {
            return res.status(400).json({ message: "Please provide name, email, and phone number." });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Please provide a valid email address." });
        }

        // Strip all spaces, dashes, and a leading + for validation
        const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, "");
        // Accept 10-digit local numbers OR international format (e.g. +91XXXXXXXXXX = 13 chars)
        const phoneRegex = /^\+?\d{10,15}$/;
        if (!phoneRegex.test(cleanPhone)) {
            return res.status(400).json({ message: "Please provide a valid phone number (10-15 digits)." });
        }

        // Resume file check (must be uploaded via multer middleware)
        if (!req.file) {
            return res.status(400).json({ message: "Please upload your CV/Resume (PDF or Office Document)." });
        }

        // Cloudinary url/filename
        const resumeUrl = req.file.path;
        const resumePublicId = req.file.filename;

        // If appliedVacancy is provided and not empty/null, check if it exists
        let vacancyId = null;
        if (appliedVacancy && appliedVacancy !== "null" && appliedVacancy !== "undefined") {
            const vacancyExists = await Vacancy.findById(appliedVacancy);
            if (vacancyExists) {
                vacancyId = vacancyExists._id;
            }
        }

        const application = await CareerApplication.create({
            name,
            email,
            phoneNumber: cleanPhone,
            appliedVacancy: vacancyId,
            generalRole: vacancyId ? undefined : generalRole,
            subject: vacancyId ? undefined : subject,
            classLevel: vacancyId ? undefined : classLevel,
            experience,
            resumeUrl,
            resumePublicId,
            coverLetter,
        });

        res.status(201).json({
            message: "Application submitted successfully! We will review your profile shortly.",
            application,
        });
    } catch (error) {
        console.error("Submit application error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ==========================================
// ADMIN CONTROLLERS
// ==========================================

// @desc    Get all vacancies (including inactive)
// @route   GET /api/careers/admin/vacancies
// @access  Private/Admin
export const getAllVacancies = async (req, res) => {
    try {
        const vacancies = await Vacancy.find({})
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 });
        res.status(200).json(vacancies);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Create a vacancy
// @route   POST /api/careers/admin/vacancies
// @access  Private/Admin
export const createVacancy = async (req, res) => {
    try {
        const { title, role, description, requirements, location, type, workMode, isActive, classLevel } = req.body;

        if (!title || !role || !description) {
            return res.status(400).json({ message: "Please provide title, role, and description." });
        }

        const vacancy = await Vacancy.create({
            title,
            role,
            description,
            requirements,
            location: location || "Mavoor, Calicut",
            type: type || "Full-time",
            workMode: workMode || "Offline",
            isActive: isActive !== undefined ? isActive : true,
            classLevel: classLevel || "",
            createdBy: req.user._id,
        });

        res.status(201).json(vacancy);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Update a vacancy
// @route   PATCH /api/careers/admin/vacancies/:id
// @access  Private/Admin
export const updateVacancy = async (req, res) => {
    try {
        const { title, role, description, requirements, location, type, workMode, isActive, classLevel } = req.body;
        const vacancy = await Vacancy.findById(req.params.id);

        if (!vacancy) {
            return res.status(404).json({ message: "Vacancy not found." });
        }

        if (title) vacancy.title = title;
        if (role) vacancy.role = role;
        if (description) vacancy.description = description;
        if (requirements !== undefined) vacancy.requirements = requirements;
        if (location) vacancy.location = location;
        if (type) vacancy.type = type;
        if (workMode) vacancy.workMode = workMode;
        if (isActive !== undefined) vacancy.isActive = isActive;
        if (classLevel !== undefined) vacancy.classLevel = classLevel;

        const updatedVacancy = await vacancy.save();
        res.status(200).json(updatedVacancy);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Delete a vacancy
// @route   DELETE /api/careers/admin/vacancies/:id
// @access  Private/Admin
export const deleteVacancy = async (req, res) => {
    try {
        const vacancy = await Vacancy.findById(req.params.id);

        if (!vacancy) {
            return res.status(404).json({ message: "Vacancy not found." });
        }

        // Set appliedVacancy to null for any applications related to this deleted vacancy
        await CareerApplication.updateMany({ appliedVacancy: req.params.id }, { $set: { appliedVacancy: null } });

        await vacancy.deleteOne();
        res.status(200).json({ message: "Vacancy deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get all applications
// @route   GET /api/careers/admin/applications
// @access  Private/Admin
export const getApplications = async (req, res) => {
    try {
        const applications = await CareerApplication.find({})
            .populate("appliedVacancy", "title role location type")
            .sort({ createdAt: -1 });
        res.status(200).json(applications);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Update application status
// @route   PATCH /api/careers/admin/applications/:id
// @access  Private/Admin
export const updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const application = await CareerApplication.findById(req.params.id);

        if (!application) {
            return res.status(404).json({ message: "Application not found." });
        }

        if (!status) {
            return res.status(400).json({ message: "Please provide a valid status." });
        }

        application.status = status;
        const updated = await application.save();

        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Delete application (deletes record & CV from Cloudinary)
// @route   DELETE /api/careers/admin/applications/:id
// @access  Private/Admin
export const deleteApplication = async (req, res) => {
    try {
        const application = await CareerApplication.findById(req.params.id);

        if (!application) {
            return res.status(404).json({ message: "Application not found." });
        }

        // Delete resume file from Cloudinary (since it is raw resource type)
        if (application.resumePublicId) {
            try {
                await cloudinary.uploader.destroy(application.resumePublicId, { resource_type: "raw" });
            } catch (clError) {
                console.error("Error deleting resume from Cloudinary:", clError);
                // Continue application deletion even if Cloudinary fails
            }
        }

        await application.deleteOne();
        res.status(200).json({ message: "Application deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
