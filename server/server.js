import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

import connectDB, { getDbStatus } from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

import authRoutes from "./routes/authRoutes.js";
import foodRoutes from "./routes/foodRoutes.js";
import donationRoutes from "./routes/donationRoutes.js";
import ngoRoutes from "./routes/ngoRoutes.js";
import automationRoutes from "./routes/automationRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import temperatureRoutes from "./routes/temperatureRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// Serve uploaded scan images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check — always available, even if the DB is down.
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "FreshLink API",
    aiMode: (process.env.AI_MODE || "demo").toLowerCase(),
    db: getDbStatus(),
    time: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/ngos", ngoRoutes);
app.use("/api/automation", automationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/temperature", temperatureRoutes);

app.get("/", (req, res) => {
  res.send("FreshLink API is running. See /api/health for status.");
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB(); // never throws — logs and degrades gracefully instead
  app.listen(PORT, () => {
    console.log(`\n🌿 FreshLink API listening on http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
  });
};

// Guard against unexpected crashes so the demo never goes down mid-presentation.
process.on("unhandledRejection", (reason) => {
  console.error("[unhandledRejection]", reason);
});
process.on("uncaughtException", (err) => {
  console.error("[uncaughtException]", err);
});

start();

export default app;
