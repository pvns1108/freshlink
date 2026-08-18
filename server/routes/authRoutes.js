import express from "express";
import { register, login, getMe } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { requireDb } from "../middleware/errorHandler.js";

const router = express.Router();

router.post("/register", requireDb, register);
router.post("/login", requireDb, login);
router.get("/me", requireDb, protect, getMe);

export default router;
