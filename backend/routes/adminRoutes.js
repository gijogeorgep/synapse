import express from "express";
import {
    createAdminUser,
    getAdminUsers,
    updateAdminUser,
    deleteAdminUser,
    blockAdminUser,
    createClassroom,
    getAdminClassrooms,
    updateClassroom,
    deleteClassroom,
    assignUsersToClassroom,
    createAnnouncement,
    getAnnouncements,
    deleteAnnouncement,
    promoteClass,
    createResource,
    getResources,
    deleteResource,
    getAuditLogs,
} from "../controllers/adminController.js";
import { 
    createExam, 
    createExamWithQuestions,
    getExams,
    submitResults
} from "../controllers/examController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply middleware to all routes in this file
router.use(protect);
router.use(authorize("admin", "superadmin"));

// User management routes
router.route("/users")
    .post(createAdminUser)
    .get(getAdminUsers);

router.route("/users/:id")
    .patch(updateAdminUser)
    .delete(deleteAdminUser);

router.route("/users/:id/block")
    .patch(blockAdminUser);

// Classroom management routes
router.route("/classrooms")
    .post(createClassroom)
    .get(getAdminClassrooms);

router.route("/classrooms/:id")
    .patch(updateClassroom)
    .delete(deleteClassroom);

router.route("/classrooms/:id/assign")
    .post(assignUsersToClassroom);

// --- Advanced Admin Routes ---

// Announcements
router.route("/announcements")
    .post(createAnnouncement)
    .get(getAnnouncements);
router.delete("/announcements/:id", deleteAnnouncement);

// Exams & Results
router.route("/exams")
    .post(createExam)
    .get(getExams);
router.post("/exams/bulk", createExamWithQuestions);
router.post("/results", submitResults);

// Bulk Promotions
router.post("/promote", promoteClass);

// Resource Library
router.route("/resources")
    .post(createResource)
    .get(getResources);
router.delete("/resources/:id", deleteResource);

// Audit Logs - Restricted to Super Admin
router.get("/audit-logs", authorize("superadmin"), getAuditLogs);

export default router;
