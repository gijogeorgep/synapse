import express from "express";
import { getMyClassrooms, updateClassroomResources } from "../controllers/classroomController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.route("/my-classrooms")
    .get(getMyClassrooms);

router.route("/:id/resources")
    .put(updateClassroomResources);

export default router;
