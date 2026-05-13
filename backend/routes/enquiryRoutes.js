import express from "express";
import {
    createEnquiryForm,
    getEnquiryForms,
    getEnquiryFormById,
    updateEnquiryForm,
    deleteEnquiryForm,
    getPublicForm,
    submitEnquiryResponse,
    getEnquiryResponses,
} from "../controllers/enquiryController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin routes
router.route("/forms")
    .post(protect, authorize("admin", "superadmin"), createEnquiryForm)
    .get(protect, authorize("admin", "superadmin"), getEnquiryForms);

router.route("/forms/:id")
    .get(protect, authorize("admin", "superadmin"), getEnquiryFormById)
    .patch(protect, authorize("admin", "superadmin"), updateEnquiryForm)
    .delete(protect, authorize("admin", "superadmin"), deleteEnquiryForm);

router.get("/forms/:id/responses", protect, authorize("admin", "superadmin"), getEnquiryResponses);

// Public routes
router.get("/public/:slug", getPublicForm);
router.post("/public/:slug/submit", submitEnquiryResponse);

export default router;
