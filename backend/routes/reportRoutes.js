import express from "express";
import { 
    getOverallStats, 
    getClassroomReports, 
    getSubjectMastery,
    getStudentsList,
    getTeachersList,
    getAdminsList,
    getTeacherStats,
    getAdminStats,
    getStudentDeepDive 
} from "../controllers/reportController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(authorize("admin", "superadmin"));

router.get("/overall", getOverallStats);
router.get("/classrooms", getClassroomReports);
router.get("/subjects", getSubjectMastery);
router.get("/students-list", getStudentsList);
router.get("/teachers-list", getTeachersList);
router.get("/admins-list", getAdminsList);
router.get("/student/:id", getStudentDeepDive);
router.get("/teacher/:id", getTeacherStats);
router.get("/admin/:id", getAdminStats);

export default router;
