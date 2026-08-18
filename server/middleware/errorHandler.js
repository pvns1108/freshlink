import { getDbStatus } from "../config/db.js";

// Blocks DB-dependent routes gracefully instead of letting the app crash
// when MongoDB is not connected (see config/db.js for the connection strategy).
export const requireDb = (req, res, next) => {
  const { connected } = getDbStatus();
  if (!connected) {
    return res.status(503).json({
      message:
        "Database unavailable right now. FreshLink's API is running, but no database is connected. " +
        "Set MONGO_URI in server/.env, or allow outbound network access so the built-in in-memory MongoDB can start.",
    });
  }
  next();
};

export const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

// Centralized error handler — ensures the API never crashes the process on a thrown error.
export const errorHandler = (err, req, res, next) => {
  console.error("[error]", err.message);
  const statusCode = err.statusCode && err.statusCode !== 200 ? err.statusCode : 500;
  res.status(statusCode).json({
    message: err.message || "Something went wrong on the server.",
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
};
