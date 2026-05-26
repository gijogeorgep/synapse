import Vacancy from "../models/Vacancy.js";
import CareerApplication from "../models/CareerApplication.js";
import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";

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
        const {
            name,
            email,
            phoneNumber,
            qualification,
            appliedVacancy,
            generalRole,
            experience,
            onlineExperience,
            offlineExperience,
            coverLetter,
            subject,
            classLevel,
            subjects,
            classLevels,
            languages,
            teachingPreferences,
        } = req.body;

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

        const parseStringArray = (value) => {
            if (!value) return [];
            if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
            if (typeof value === "string") {
                const trimmed = value.trim();
                if (!trimmed) return [];
                // Allow JSON-encoded arrays from multipart form submissions
                if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
                    try {
                        const parsed = JSON.parse(trimmed);
                        if (Array.isArray(parsed)) return parsed.map((v) => String(v).trim()).filter(Boolean);
                    } catch {
                        // fall through
                    }
                }
                // Fallback: comma-separated values
                return trimmed
                    .split(",")
                    .map((v) => v.trim())
                    .filter(Boolean);
            }
            return [];
        };

        const normalizedSubjects = parseStringArray(subjects);
        const normalizedClassLevels = parseStringArray(classLevels);
        const normalizedLanguages = parseStringArray(languages);

        const parsePreferences = (value) => {
            if (!value) return [];
            if (Array.isArray(value)) return value;
            if (typeof value === "string") {
                const trimmed = value.trim();
                if (!trimmed) return [];
                try {
                    const parsed = JSON.parse(trimmed);
                    return Array.isArray(parsed) ? parsed : [];
                } catch {
                    return [];
                }
            }
            return [];
        };

        const normalizedTeachingPreferences = parsePreferences(teachingPreferences)
            .map((p) => {
                const classLevelValue = p?.classLevel !== undefined && p?.classLevel !== null ? String(p.classLevel).trim() : "";
                if (!classLevelValue) return null;
                const prefSubjects = parseStringArray(p?.subjects);
                const prefLanguages = parseStringArray(p?.languages);
                return {
                    classLevel: classLevelValue,
                    subjects: Array.from(new Set(prefSubjects)),
                    languages: Array.from(new Set(prefLanguages)),
                };
            })
            .filter(Boolean);

        const onlineExpStr = onlineExperience !== undefined && onlineExperience !== null ? String(onlineExperience).trim() : "";
        const offlineExpStr = offlineExperience !== undefined && offlineExperience !== null ? String(offlineExperience).trim() : "";

        // Keep legacy experience populated when possible (used in some UIs)
        let legacyExperience = experience !== undefined && experience !== null ? String(experience).trim() : "";
        if (!legacyExperience && (onlineExpStr || offlineExpStr)) {
            const onlineNum = Number(onlineExpStr || 0);
            const offlineNum = Number(offlineExpStr || 0);
            const total = Number.isFinite(onlineNum) && Number.isFinite(offlineNum) ? onlineNum + offlineNum : NaN;
            legacyExperience = Number.isFinite(total) ? String(total) : "";
        }

        const application = await CareerApplication.create({
            name,
            email,
            phoneNumber: cleanPhone,
            qualification: qualification ? String(qualification).trim() : undefined,
            appliedVacancy: vacancyId,
            generalRole: vacancyId ? undefined : generalRole,
            subject: vacancyId ? undefined : (normalizedSubjects[0] || subject),
            subjects: vacancyId ? undefined : (normalizedSubjects.length ? normalizedSubjects : undefined),
            classLevel: vacancyId ? undefined : (normalizedClassLevels[0] || classLevel),
            classLevels: vacancyId ? undefined : (normalizedClassLevels.length ? normalizedClassLevels : undefined),
            languages: vacancyId ? undefined : (normalizedLanguages.length ? normalizedLanguages : undefined),
            teachingPreferences: vacancyId
                ? undefined
                : (normalizedTeachingPreferences.length ? normalizedTeachingPreferences : undefined),
            experience: legacyExperience,
            onlineExperience: onlineExpStr || undefined,
            offlineExperience: offlineExpStr || undefined,
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

// @desc    Stream/preview a candidate resume (admin only)
// @route   GET /api/careers/admin/applications/:id/resume?download=1
// @access  Private/Admin (token allowed via query param)
export const streamApplicationResume = async (req, res) => {
    try {
        const application = await CareerApplication.findById(req.params.id);
        if (!application) {
            return res.status(404).json({ message: "Application not found." });
        }
        if (!application.resumeUrl) {
            return res.status(404).json({ message: "Resume not found for this application." });
        }

        const upstream = await fetch(application.resumeUrl);
        if (!upstream.ok) {
            return res.status(502).json({ message: "Unable to fetch resume from storage." });
        }

        const contentType = upstream.headers.get("content-type") || "application/octet-stream";
        const isDownload = String(req.query.download || "").toLowerCase() === "1" || String(req.query.download || "").toLowerCase() === "true";

        const safeBaseName = (String(application.name || "candidate").trim().replace(/[^\w\-]+/g, "_") || "candidate").slice(0, 60);
        const urlLower = String(application.resumeUrl || "").toLowerCase();
        const extFromUrl =
            urlLower.includes(".docx") ? "docx" :
            urlLower.includes(".doc") ? "doc" :
            urlLower.includes(".pdf") ? "pdf" :
            "";
        const ext =
            contentType.includes("pdf") ? "pdf" :
            contentType.includes("msword") ? "doc" :
            contentType.includes("wordprocessingml") ? "docx" :
            extFromUrl || "pdf";
        const fileName = `${safeBaseName}_CV.${ext}`;

        res.setHeader("Content-Type", contentType);
        res.setHeader("Content-Disposition", `${isDownload ? "attachment" : "inline"}; filename="${fileName}"`);
        res.setHeader("Cache-Control", "private, max-age=0, no-cache");

        // Stream response body (Node fetch returns a Web ReadableStream)
        if (upstream.body) {
            try {
                Readable.fromWeb(upstream.body).pipe(res);
                return;
            } catch {
                // fall back to buffering below
            }
        }

        const arrayBuffer = await upstream.arrayBuffer();
        return res.status(200).send(Buffer.from(arrayBuffer));
    } catch (error) {
        console.error("Stream resume error:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};
