import Notification from "../models/Notification.js";
import asyncHandler from "../utils/asyncHandler.js";

// @route GET /api/notifications
export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(100);
  const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });
  res.json({ notifications, unreadCount });
});

// @route PUT /api/notifications/:id/read
export const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true },
    { new: true }
  );
  if (!notification) return res.status(404).json({ message: "Notification not found." });
  res.json({ notification });
});

export default { getNotifications, markNotificationRead };
