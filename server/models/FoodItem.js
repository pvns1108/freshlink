import mongoose from "mongoose";

const foodItemSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: [
        "Dairy",
        "Bakery",
        "Produce",
        "Grains",
        "Packaged Food",
        "Canned Food",
        "Other",
      ],
      default: "Other",
    },
    quantity: { type: Number, required: true, default: 1 },
    unit: { type: String, default: "units" },
    expiryDate: { type: Date, required: true },
    storageLocation: { type: String, default: "" },
    temperatureC: { type: Number, default: null },
    notes: { type: String, default: "" },

    // AI analysis results
    imageUrl: { type: String, default: "" },
    aiCondition: {
      type: String,
      enum: [
        "Fresh",
        "Normal",
        "Near Expiry",
        "Possible Deterioration",
        "Inspection Required",
      ],
      default: "Normal",
    },
    aiConfidence: { type: Number, default: null }, // 0..1
    possibleIssues: { type: [String], default: [] },
    inspectionRequired: { type: Boolean, default: false },
    aiMode: { type: String, enum: ["demo", "api"], default: "demo" },

    // Priority engine output
    priorityScore: { type: Number, default: 0 },
    priorityLevel: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "LOW",
    },
    priorityReasons: { type: [String], default: [] },
    recommendedAction: { type: String, default: "" },

    // Workflow / status
    status: {
      type: String,
      enum: [
        "Fresh",
        "Near Expiry",
        "Donation Candidate",
        "Inspection Required",
        "Expired",
        "Donated",
        "Used",
        "Discarded",
      ],
      default: "Fresh",
    },
    discountSuggested: { type: Number, default: null }, // percentage
    discountApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

foodItemSchema.index({ owner: 1, status: 1 });
foodItemSchema.index({ expiryDate: 1 });

export default mongoose.model("FoodItem", foodItemSchema);
