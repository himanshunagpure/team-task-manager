import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getNotifications,
  markAsRead,
  respondToInvitation,
} from "../controllers/notificationController.js";

const router = express.Router();

// Get all notifications for logged-in user
router.get(
  "/",
  protect,
  getNotifications
);

// Mark notification as read
router.put(
  "/:notificationId/read",
  protect,
  markAsRead
);

// Respond to invitation (accept/deny)
router.post(
  "/:notificationId/respond",
  protect,
  respondToInvitation
);

export default router;
