import express from "express";
const router = express.Router();
import {
  createEvent,
  getEvents,
  deleteEvent,
  updateEvent,
} from "../controllers/eventController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

router
  .route("/")
  .post(protect, authorize("admin", "superadmin"), createEvent)
  .get(protect, getEvents);

router
  .route("/:id")
  .put(protect, authorize("admin", "superadmin"), updateEvent)
  .delete(protect, authorize("admin", "superadmin"), deleteEvent);

export default router;
