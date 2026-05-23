import express from "express";
import {
    getPublicVacancies,
    getPublicVacancyById,
    submitApplication,
    getAllVacancies,
    createVacancy,
    updateVacancy,
    deleteVacancy,
    getApplications,
    streamApplicationResume,
    updateApplicationStatus,
    deleteApplication
} from "../controllers/careerController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { uploadFile } from "../middleware/uploadMiddleware.js";
import { logAdminAction } from "../middleware/auditMiddleware.js";

const router = express.Router();

// ==========================================
// PUBLIC ROUTES
// ==========================================

// Get active vacancies
router.get("/vacancies", getPublicVacancies);

// Get active vacancy by ID
router.get("/vacancies/:id", getPublicVacancyById);

// Submit application (includes CV file upload)
// Matches field 'resume' in the multipart form
router.post("/apply", uploadFile.single("resume"), submitApplication);

// ==========================================
// ADMIN ROUTES (Protected)
// ==========================================

// Apply protection middleware to all administrative endpoints
router.use(protect);
router.use(authorize("admin", "superadmin"));

// Vacancies management routes
router.route("/admin/vacancies")
    .get(getAllVacancies)
    .post(
        logAdminAction("Create Job Vacancy", (req) => `Posted job vacancy: ${req.body.title || 'Unknown'}`),
        createVacancy
    );

router.route("/admin/vacancies/:id")
    .patch(
        logAdminAction("Update Job Vacancy", (req) => `Updated job vacancy ${req.params.id}`),
        updateVacancy
    )
    .delete(
        logAdminAction("Delete Job Vacancy", (req) => `Deleted job vacancy ${req.params.id}`),
        deleteVacancy
    );

// Applications review routes
router.route("/admin/applications")
    .get(getApplications);

// Resume preview/download (streamed via backend; token allowed via query param)
router.get(
    "/admin/applications/:id/resume",
    logAdminAction("View/Download Career Application Resume", (req) => `Accessed resume for application ${req.params.id}`),
    streamApplicationResume
);

router.route("/admin/applications/:id")
    .patch(
        logAdminAction("Update Career Application Status", (req) => `Updated application ${req.params.id} status to: ${req.body.status}`),
        updateApplicationStatus
    )
    .delete(
        logAdminAction("Delete Career Application", (req) => `Deleted application ${req.params.id}`),
        deleteApplication
    );

export default router;
