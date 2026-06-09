import express from "express";
import {
    createExam,
    getExams,
    addQuestion,
    saveDraftQuestion,
    getDraftQuestions,
    updateQuestion,
    publishQuestion,
    deleteQuestion,
    getExamQuestions,
    submitExam,
    createExamWithQuestions,
    deleteExam,
    getExamDetails,
    getMyResults,
    updateExam,
    transferExam,
    getExamResults,
} from "../controllers/examController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getExams).post(protect, authorize("teacher", "admin", "superadmin"), createExam);

router.post("/bulk", protect, authorize("teacher", "admin", "superadmin"), createExamWithQuestions);
router.post("/:id/transfer", protect, authorize("teacher", "admin", "superadmin"), transferExam);

router.post("/questions/draft", protect, authorize("teacher", "admin", "superadmin"), saveDraftQuestion);
router.get("/questions/drafts", protect, authorize("teacher", "admin", "superadmin"), getDraftQuestions);
router.put("/questions/:id", protect, authorize("teacher", "admin", "superadmin"), updateQuestion);
router.post("/questions/:id/publish", protect, authorize("teacher", "admin", "superadmin"), publishQuestion);

router.route("/my-results").get(protect, authorize("student"), getMyResults);

router
    .route("/:id")
    .get(protect, getExamDetails)
    .put(protect, authorize("teacher", "admin", "superadmin"), updateExam)
    .delete(protect, authorize("teacher", "admin", "superadmin"), deleteExam);

router
    .route("/:id/questions")
    .get(protect, getExamQuestions)
    .post(protect, authorize("teacher", "admin", "superadmin"), addQuestion);

router.delete("/questions/:id", protect, authorize("teacher", "admin", "superadmin"), deleteQuestion);

router.post("/:id/submit", protect, submitExam);
router.get("/:id/results", protect, getExamResults);


export default router;
