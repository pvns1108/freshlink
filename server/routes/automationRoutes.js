import express from "express";
import { getAutomationLogs } from "../controllers/automationController.js";
import { protect } from "../middleware/auth.js";
import { requireDb } from "../middleware/errorHandler.js";

const router = express.Router();

router.use(protect, requireDb);
router.get("/logs", getAutomationLogs);

export default router;
