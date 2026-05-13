import express from "express";
import {
    createAdminUser,
    getAdminUsers,
    updateAdminUser,
    deleteAdminUser,
    blockAdminUser,
    createClassroom,
    getAdminClassrooms,
    getAdminClassroomById,
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
import { logAdminAction } from "../middleware/auditMiddleware.js";

const router = express.Router();

// Apply middleware to all routes in this file
router.use(protect);
router.use(authorize("admin", "superadmin"));

// User management routes
router.route("/users")
    .post(
        logAdminAction("Create Admin User", (req) => {
            const email = req?.body?.email ? ` (${req.body.email})` : "";
            const role = req?.body?.role ? ` role=${req.body.role}` : "";
            return `Created admin user${email}.${role}`.trim();
        }),
        createAdminUser,
    )
    .get(getAdminUsers);

router.route("/users/:id")
    .patch(
        logAdminAction("Update Admin User", (req) => {
            const changedFields = Object.keys(req?.body || {}).filter((k) => k !== "id");
            const fieldsText = changedFields.length ? changedFields.join(", ") : "unknown fields";
            return `Updated user ${req.params.id}. Fields: ${fieldsText}`;
        }),
        updateAdminUser,
    )
    .delete(
        logAdminAction("Delete Admin User", (req) => `Deleted user ${req.params.id}`),
        deleteAdminUser,
    );

router.route("/users/:id/block")
    .patch(
        logAdminAction("Block/Unblock Admin User", (req) => `Toggled block status for user ${req.params.id}`),
        blockAdminUser,
    );

// Classroom management routes
router.route("/classrooms")
    .post(
        logAdminAction("Create Classroom", (req) => {
            const name = req?.body?.name || req?.body?.className || "";
            return name ? `Created classroom: ${name}` : "Created classroom";
        }),
        createClassroom,
    )
    .get(getAdminClassrooms);

router.route("/classrooms/:id")
    .get(getAdminClassroomById)
    .patch(
        logAdminAction("Update Classroom", (req) => {
            const changedFields = Object.keys(req?.body || {}).filter((k) => k !== "id");
            const fieldsText = changedFields.length ? changedFields.join(", ") : "unknown fields";
            return `Updated classroom ${req.params.id}. Fields: ${fieldsText}`;
        }),
        updateClassroom,
    )
    .delete(
        logAdminAction("Delete Classroom", (req) => `Deleted classroom ${req.params.id}`),
        deleteClassroom,
    );

router.route("/classrooms/:id/assign")
    .post(
        logAdminAction("Assign Users To Classroom", (req) => {
            const count = Array.isArray(req?.body?.userIds) ? req.body.userIds.length : undefined;
            const suffix = typeof count === "number" ? ` (${count} users)` : "";
            return `Assigned users to classroom ${req.params.id}${suffix}`;
        }),
        assignUsersToClassroom,
    );

// --- Advanced Admin Routes ---

// Announcements
router.route("/announcements")
    .post(
        logAdminAction("Create Announcement", (req) => {
            const title = req?.body?.title ? `: ${req.body.title}` : "";
            return `Created announcement${title}`;
        }),
        createAnnouncement,
    )
    .get(getAnnouncements);
router.delete(
    "/announcements/:id",
    logAdminAction("Delete Announcement", (req) => `Deleted announcement ${req.params.id}`),
    deleteAnnouncement,
);

// Exams & Results
router.route("/exams")
    .post(
        logAdminAction("Create Exam", (req) => {
            const subject = req?.body?.subject ? ` subject=${req.body.subject}` : "";
            const classLevel = req?.body?.classLevel ? ` class=${req.body.classLevel}` : "";
            return `Created exam.${subject}${classLevel}`.trim();
        }),
        createExam,
    )
    .get(getExams);
router.post(
    "/exams/bulk",
    logAdminAction("Create Bulk Exam", (req) => {
        const count = Array.isArray(req?.body?.exams) ? req.body.exams.length : undefined;
        const suffix = typeof count === "number" ? ` (${count} exams)` : "";
        return `Created bulk exams${suffix}`;
    }),
    createExamWithQuestions,
);
router.post(
    "/results",
    logAdminAction("Submit Results", (req) => {
        const examId = req?.body?.examId ? ` examId=${req.body.examId}` : "";
        return `Submitted results.${examId}`.trim();
    }),
    submitResults,
);

// Bulk Promotions
router.post(
    "/promote",
    logAdminAction("Bulk Promotions", (req) => {
        const classroomId = req?.body?.classroomId ? ` classroomId=${req.body.classroomId}` : "";
        const fromRole = req?.body?.fromRole ? ` from=${req.body.fromRole}` : "";
        const toRole = req?.body?.toRole ? ` to=${req.body.toRole}` : "";
        return `Bulk promotion.${classroomId}${fromRole}${toRole}`.trim();
    }),
    promoteClass,
);

// Resource Library
router.route("/resources")
    .post(
        logAdminAction("Create Resource", (req) => {
            const title = req?.body?.title ? `: ${req.body.title}` : "";
            return `Created resource${title}`;
        }),
        createResource,
    )
    .get(getResources);
router.delete(
    "/resources/:id",
    logAdminAction("Delete Resource", (req) => `Deleted resource ${req.params.id}`),
    deleteResource,
);

// Audit Logs - Restricted to Super Admin
router.get("/audit-logs", authorize("superadmin"), getAuditLogs);

export default router;
