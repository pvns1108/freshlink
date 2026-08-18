import express from "express";
import { getNGOs, getNearbyNGOs } from "../controllers/ngoController.js";
import { protect } from "../middleware/auth.js";
import { requireDb } from "../middleware/errorHandler.js";

const router = express.Router();

router.use(protect, requireDb);
router.get("/", getNGOs);
router.get("/nearby", getNearbyNGOs);

export default router;
