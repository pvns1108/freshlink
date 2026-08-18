import express from "express";
import { getDonations, getDonation, createDonation, updateDonation } from "../controllers/donationController.js";
import { protect } from "../middleware/auth.js";
import { requireDb } from "../middleware/errorHandler.js";

const router = express.Router();

router.use(protect, requireDb);
router.get("/", getDonations);
router.post("/", createDonation);
router.get("/:id", getDonation);
router.put("/:id", updateDonation);

export default router;
