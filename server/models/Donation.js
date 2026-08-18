import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    donationCode: { type: String, required: true, unique: true },
    donor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    foodItem: { type: mongoose.Schema.Types.ObjectId, ref: "FoodItem" },
    foodDescription: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, default: "units" },
    category: { type: String, default: "Other" },
    expiryDate: { type: Date },
    priorityLevel: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "MEDIUM",
    },
    matchedNGO: { type: mongoose.Schema.Types.ObjectId, ref: "NGO" },
    matchScore: { type: Number, default: null },
    status: {
      type: String,
      enum: [
        "Pending",
        "Matched",
        "Accepted",
        "Pickup Scheduled",
        "Picked Up",
        "Completed",
        "Cancelled",
      ],
      default: "Pending",
    },
    pickupTime: { type: Date, default: null },
    pickupNotes: { type: String, default: "" },
    safetyDisclaimer: {
      type: String,
      default:
        "Potential donation candidate — NGO/recipient should inspect before acceptance.",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Donation", donationSchema);
