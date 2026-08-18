import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["expiry", "donation", "ngo", "pickup", "inspection", "system"],
      default: "system",
    },
    relatedFoodItem: { type: mongoose.Schema.Types.ObjectId, ref: "FoodItem" },
    relatedDonation: { type: mongoose.Schema.Types.ObjectId, ref: "Donation" },
    isRead: { type: Boolean, default: false },
    emailSimulated: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
