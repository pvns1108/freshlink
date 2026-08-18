import express from "express";
import { getTemperatureReadings, addTemperatureReading } from "../controllers/temperatureController.js";
import { protect } from "../middleware/auth.js";
import { requireDb } from "../middleware/errorHandler.js";

const router = express.Router();

router.use(protect, requireDb);
router.get("/", getTemperatureReadings);
router.post("/", addTemperatureReading);

export default router;
