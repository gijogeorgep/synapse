import express from "express";
import {
    createExam,
    getExams,
    addQuestion,
    getExamQuestions,
    submitExam,
    createExamWithQuestions,
    deleteExam,
    getExamDetails,
    getMyResults,
    updateExam,
} from "../controllers/examController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getExams).post(protect, authorize("teacher", "admin"), createExam);

router.post("/bulk", protect, authorize("teacher", "admin"), createExamWithQuestions);

router.route("/my-results").get(protect, authorize("student"), getMyResults);

router
    .route("/:id")
    .get(protect, getExamDetails)
    .put(protect, authorize("teacher", "admin"), updateExam)
    .delete(protect, authorize("teacher", "admin"), deleteExam);

router
    .route("/:id/questions")
    .get(protect, getExamQuestions)
    .post(protect, authorize("teacher", "admin"), addQuestion);

router.post("/:id/submit", protect, submitExam);

export default router;
