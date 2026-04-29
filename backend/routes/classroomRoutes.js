import express from "express";
import { getMyClassrooms, updateClassroomResources, getPublicClassrooms, enrollInClassroom, deleteClassroomResource, viewClassroomResourceProxy } from "../controllers/classroomController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/public", getPublicClassrooms);

// Private routes
router.use(protect);

router.get("/view-note/:id/:noteId", protect, viewClassroomResourceProxy);
router.get("/view-note/:id/:noteId/:filename", protect, viewClassroomResourceProxy);
router.get("/my-classrooms", getMyClassrooms);
router.put("/:id/resources", updateClassroomResources);
router.delete("/:id/resources/:noteId", deleteClassroomResource);
router.post("/:id/enroll", enrollInClassroom);

export default router;
