import express from "express";
import {
  getFoodItems,
  getFoodItem,
  createFoodItem,
  scanFood,
  updateFoodItem,
  deleteFoodItem,
  donateFoodItem,
} from "../controllers/foodController.js";
import { protect } from "../middleware/auth.js";
import { requireDb } from "../middleware/errorHandler.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.use(protect);

// NOTE: /scan does not require the DB — it returns a live AI/OCR analysis
// preview without persisting, so it still works even if MongoDB is down.
router.post("/scan", upload.single("image"), scanFood);

router.use(requireDb);
router.get("/", getFoodItems);
router.post("/", createFoodItem);
router.get("/:id", getFoodItem);
router.put("/:id", updateFoodItem);
router.delete("/:id", deleteFoodItem);
router.post("/:id/donate", donateFoodItem);

export default router;
