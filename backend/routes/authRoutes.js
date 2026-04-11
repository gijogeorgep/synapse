import express from "express";
import {
    sendOTP,
    registerUser,
    authUser,
    getUserProfile,
    updateUserProfile,
    updateUserPassword,
    adminLogin,
    logoutUser,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/send-otp", sendOTP);
router.post("/register", registerUser);
router.post("/login", authUser);
router.post("/admin/login", adminLogin);
router.route("/profile").get(protect, getUserProfile).put(protect, updateUserProfile);
router.route("/profile/password").put(protect, updateUserPassword);
router.post("/logout", protect, logoutUser);

export default router;
