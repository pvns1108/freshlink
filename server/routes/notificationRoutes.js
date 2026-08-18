import express from "express";
import { getNotifications, markNotificationRead } from "../controllers/notificationController.js";
import { protect } from "../middleware/auth.js";
import { requireDb } from "../middleware/errorHandler.js";

const router = express.Router();

router.use(protect, requireDb);
router.get("/", getNotifications);
router.put("/:id/read", markNotificationRead);

export default router;
