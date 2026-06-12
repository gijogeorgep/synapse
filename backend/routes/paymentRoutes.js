import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createOrder, handlePaymentCallback, verifyPayment, getAdminPaymentStats } from "../controllers/paymentController.js";

const router = express.Router();

// Stats endpoint
router.get("/stats", protect, getAdminPaymentStats);

// Payment routes
router.post("/create-order", protect, createOrder);
router.post("/verify", protect, verifyPayment);
router.post("/callback", handlePaymentCallback);

export default router;
