import TemperatureReading from "../models/TemperatureReading.js";
import AutomationLog from "../models/AutomationLog.js";
import asyncHandler from "../utils/asyncHandler.js";
import { notify } from "../services/notificationService.js";

const EXCURSION_THRESHOLD_C = 8;

// @route GET /api/temperature?foodItem=<id>
export const getTemperatureReadings = asyncHandler(async (req, res) => {
  const query = req.user.role === "admin" ? {} : { owner: req.user._id };
  if (req.query.foodItem) query.foodItem = req.query.foodItem;

  const readings = await TemperatureReading.find(query).sort({ recordedAt: 1 }).limit(500);
  res.json({ readings, thresholdC: EXCURSION_THRESHOLD_C });
});

// @route POST /api/temperature
export const addTemperatureReading = asyncHandler(async (req, res) => {
  const { foodItem, temperatureC, recordedAt } = req.body;

  if (temperatureC === undefined || temperatureC === null) {
    return res.status(400).json({ message: "temperatureC is required." });
  }

  const excursion = temperatureC > EXCURSION_THRESHOLD_C;

  const reading = await TemperatureReading.create({
    foodItem,
    owner: req.user._id,
    temperatureC,
    recordedAt: recordedAt || new Date(),
    excursion,
    source: req.body.source || "manual",
  });

  if (excursion) {
    await AutomationLog.create({
      user: req.user._id,
      relatedFoodItem: foodItem,
      action: "TEMPERATURE_EXCURSION",
      message: `Temperature excursion detected (${temperatureC}°C) — inspection recommended.`,
    });

    await notify({
      userId: req.user._id,
      userEmail: req.user.email,
      title: "Temperature excursion detected",
      message: `Temperature excursion detected (${temperatureC}°C) — inspection recommended.`,
      type: "inspection",
      relatedFoodItem: foodItem,
    });
  }

  res.status(201).json({ reading });
});

export default { getTemperatureReadings, addTemperatureReading };
