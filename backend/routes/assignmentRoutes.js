import express from "express";
import {
    createAssignment,
    getClassroomAssignments,
    submitAssignment,
    getAssignmentSubmissions,
    gradeSubmission,
    viewSubmissionFile,
    deleteAssignment
} from "../controllers/assignmentController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", authorize('teacher', 'admin', 'superadmin'), createAssignment);
router.delete("/:id", authorize('teacher', 'admin', 'superadmin'), deleteAssignment);
router.get("/classroom/:classroomId", getClassroomAssignments);
router.post("/:id/submit", submitAssignment);
router.get("/:id/submissions", authorize('teacher', 'admin', 'superadmin'), getAssignmentSubmissions);
router.put("/submissions/:id/grade", authorize('teacher', 'admin', 'superadmin'), gradeSubmission);
router.get("/submissions/:id/view", viewSubmissionFile);

export default router;
