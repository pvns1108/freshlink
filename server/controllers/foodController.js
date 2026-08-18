import FoodItem from "../models/FoodItem.js";
import asyncHandler from "../utils/asyncHandler.js";
import { analyzeFoodImage, AI_DISCLAIMER } from "../services/aiService.js";
import { extractExpiryDate } from "../services/ocrService.js";
import { calculateFoodPriority } from "../services/priorityEngine.js";
import { runFoodWorkflow, createDonationWithMatching } from "../services/automationEngine.js";

const scopeQuery = (req) => {
  // Admins and NGOs can see everything relevant to their dashboard;
  // households/shops only see their own inventory.
  if (req.user.role === "admin") return {};
  return { owner: req.user._id };
};

// @route GET /api/food
export const getFoodItems = asyncHandler(async (req, res) => {
  const { status, category, sort } = req.query;
  const query = scopeQuery(req);
  if (status && status !== "All") query.status = status;
  if (category && category !== "All") query.category = category;

  let sortSpec = { createdAt: -1 };
  if (sort === "expiry") sortSpec = { expiryDate: 1 };
  if (sort === "priority") sortSpec = { priorityScore: -1 };
  if (sort === "quantity") sortSpec = { quantity: -1 };

  const items = await FoodItem.find(query).sort(sortSpec).populate("owner", "name role");
  res.json({ items });
});

// @route GET /api/food/:id
export const getFoodItem = asyncHandler(async (req, res) => {
  const item = await FoodItem.findById(req.params.id).populate("owner", "name role");
  if (!item) return res.status(404).json({ message: "Food item not found." });
  res.json({ item });
});

// @route POST /api/food  (manual add)
export const createFoodItem = asyncHandler(async (req, res) => {
  const payload = { ...req.body, owner: req.user._id };

  if (!payload.name || !payload.expiryDate) {
    return res.status(400).json({ message: "Food name and expiry date are required." });
  }

  // Run AI condition classification using the declared condition/name if no image provided
  const analysis = payload.skipAI
    ? null
    : await analyzeFoodImage({ declaredFoodName: payload.name });

  if (analysis) {
    payload.aiCondition = payload.condition || analysis.condition;
    payload.aiConfidence = analysis.confidence;
    payload.possibleIssues = analysis.possibleIssues;
    payload.inspectionRequired = analysis.inspectionRequired;
    payload.aiMode = analysis.aiMode;
  } else {
    payload.aiCondition = payload.condition || "Normal";
  }

  const priority = calculateFoodPriority({
    expiryDate: payload.expiryDate,
    category: payload.category,
    quantity: payload.quantity || 1,
    aiCondition: payload.aiCondition,
    temperatureC: payload.temperatureC,
  });

  payload.priorityScore = priority.priorityScore;
  payload.priorityLevel = priority.priorityLevel;
  payload.priorityReasons = priority.reasons;
  payload.recommendedAction = priority.recommendedAction;

  const item = await FoodItem.create(payload);

  const { workflow, donation, ngoMatches } = await runFoodWorkflow({ foodItem: item, user: req.user });

  res.status(201).json({
    item,
    workflow,
    donation,
    ngoMatches,
    disclaimer: AI_DISCLAIMER,
  });
});

// @route POST /api/food/scan  (image upload + OCR + AI analysis, does not save yet)
export const scanFood = asyncHandler(async (req, res) => {
  const declaredFoodName = req.body.foodName || "";
  const imagePath = req.file ? req.file.path : null;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  const [ocrResult, analysis] = await Promise.all([
    imagePath
      ? extractExpiryDate(imagePath)
      : Promise.resolve({ success: false, message: "No image provided for OCR." }),
    analyzeFoodImage({ declaredFoodName, imagePath }),
  ]);

  res.json({
    imageUrl,
    foodDetected: analysis.foodType,
    expiry: ocrResult.success
      ? { detected: true, date: ocrResult.expiryDate, confidence: ocrResult.confidence }
      : { detected: false, message: ocrResult.message },
    condition: analysis.condition,
    confidence: analysis.confidence,
    possibleIssues: analysis.possibleIssues,
    inspectionRequired: analysis.inspectionRequired,
    aiMode: analysis.aiMode,
    disclaimer: AI_DISCLAIMER,
  });
});

// @route PUT /api/food/:id
export const updateFoodItem = asyncHandler(async (req, res) => {
  const item = await FoodItem.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Food item not found." });

  if (String(item.owner) !== String(req.user._id) && req.user.role !== "admin") {
    return res.status(403).json({ message: "You can only edit your own food items." });
  }

  Object.assign(item, req.body);

  // Recalculate priority if relevant fields changed
  const priority = calculateFoodPriority({
    expiryDate: item.expiryDate,
    category: item.category,
    quantity: item.quantity,
    aiCondition: item.aiCondition,
    temperatureC: item.temperatureC,
  });
  item.priorityScore = priority.priorityScore;
  item.priorityLevel = priority.priorityLevel;
  item.priorityReasons = priority.reasons;
  item.recommendedAction = priority.recommendedAction;

  await item.save();
  res.json({ item });
});

// @route DELETE /api/food/:id
export const deleteFoodItem = asyncHandler(async (req, res) => {
  const item = await FoodItem.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Food item not found." });

  if (String(item.owner) !== String(req.user._id) && req.user.role !== "admin") {
    return res.status(403).json({ message: "You can only delete your own food items." });
  }

  await item.deleteOne();
  res.json({ message: "Food item deleted." });
});

// @route POST /api/food/:id/donate  (manually trigger donation + NGO matching for an existing item)
export const donateFoodItem = asyncHandler(async (req, res) => {
  const item = await FoodItem.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Food item not found." });

  if (String(item.owner) !== String(req.user._id) && req.user.role !== "admin") {
    return res.status(403).json({ message: "You can only donate your own food items." });
  }

  if (item.aiCondition === "Possible Deterioration" || item.aiCondition === "Inspection Required") {
    return res.status(400).json({
      message: "This item is flagged for inspection and should be reviewed before it can be donated.",
    });
  }

  item.status = "Donation Candidate";
  await item.save();

  const { donation, ngoMatches } = await createDonationWithMatching({ foodItem: item, user: req.user });
  res.json({ item, donation, ngoMatches });
});

export default {
  getFoodItems,
  getFoodItem,
  createFoodItem,
  scanFood,
  updateFoodItem,
  deleteFoodItem,
  donateFoodItem,
};
