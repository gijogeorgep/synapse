import express from "express";
import {
    registerUser,
    authUser,
    getUserProfile,
    updateUserProfile,
    updateUserPassword,
    adminLogin,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", authUser);
router.post("/admin/login", adminLogin);
router.route("/profile").get(protect, getUserProfile).put(protect, updateUserProfile);
router.route("/profile/password").put(protect, updateUserPassword);

export default router;
