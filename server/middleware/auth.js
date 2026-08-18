import jwt from "jsonwebtoken";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

// Verifies the JWT and attaches the user to req.user
export const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized — no token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "freshlink_dev_secret_change_me");
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Not authorized — user not found or inactive." });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Not authorized — invalid or expired token." });
  }
});

// Role-based access control middleware
export const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({
      message: `Access denied — requires one of the following roles: ${roles.join(", ")}`,
    });
  }
  next();
};
