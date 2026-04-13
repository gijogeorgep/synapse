import express from "express";
import {
    createAssignment,
    getClassroomAssignments,
    submitAssignment,
    getAssignmentSubmissions,
    gradeSubmission
} from "../controllers/assignmentController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", authorize('teacher', 'admin', 'superadmin'), createAssignment);
router.get("/classroom/:classroomId", getClassroomAssignments);
router.post("/:id/submit", submitAssignment);
router.get("/:id/submissions", authorize('teacher', 'admin', 'superadmin'), getAssignmentSubmissions);
router.put("/submissions/:id/grade", authorize('teacher', 'admin', 'superadmin'), gradeSubmission);

export default router;
