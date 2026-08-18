import AutomationLog from "../models/AutomationLog.js";
import asyncHandler from "../utils/asyncHandler.js";

// @route GET /api/automation/logs
export const getAutomationLogs = asyncHandler(async (req, res) => {
  const query = req.user.role === "admin" ? {} : { user: req.user._id };
  const logs = await AutomationLog.find(query)
    .sort({ createdAt: -1 })
    .limit(200)
    .populate("relatedFoodItem", "name")
    .populate("relatedDonation", "donationCode");
  res.json({ logs });
});

export default { getAutomationLogs };
