import express from "express";
import { getMyClassrooms, updateClassroomResources, getPublicClassrooms, enrollInClassroom } from "../controllers/classroomController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/public", getPublicClassrooms);

// Private routes
router.use(protect);

router.route("/my-classrooms")
    .get(getMyClassrooms);

router.route("/:id/resources")
    .put(updateClassroomResources);

router.route("/:id/enroll")
    .post(enrollInClassroom);

export default router;
