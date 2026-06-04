import express from "express";
import { createOrder, handlePaymentCallback, verifyPayment } from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create-order", protect, createOrder);
router.post("/verify", protect, verifyPayment);
router.post("/callback", handlePaymentCallback);

export default router;
