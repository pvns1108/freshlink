import mongoose from "mongoose";

const automationLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    relatedFoodItem: { type: mongoose.Schema.Types.ObjectId, ref: "FoodItem" },
    relatedDonation: { type: mongoose.Schema.Types.ObjectId, ref: "Donation" },
    action: { type: String, required: true }, // e.g. "AI_ANALYSIS", "PRIORITY_SCORED"
    message: { type: String, required: true },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default mongoose.model("AutomationLog", automationLogSchema);
