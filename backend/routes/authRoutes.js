// routes/authRoutes.js
import express from "express";
import {
  registerUser,
  verifyOTP,
  loginUser,
  resendOTP,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify", protect, verifyOTP);
router.post("/login", loginUser);
router.post("/resend-otp", resendOTP);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/me", protect, getProfile);
router.put("/update", protect, updateProfile);

export default router;