import express from "express";
const router = express.Router();
import {
  createLessonReport,
  getLessonReports,
  deleteLessonReport,
  updateLessonReport,
} from "../controllers/lessonReportController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

router
  .route("/")
  .post(protect, authorize("teacher", "admin", "superadmin"), createLessonReport)
  .get(protect, getLessonReports);

router
  .route("/:id")
  .put(protect, authorize("teacher", "admin", "superadmin"), updateLessonReport)
  .delete(protect, authorize("teacher", "admin", "superadmin"), deleteLessonReport);

export default router;
