import mongoose from "mongoose";

const ngoSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    location: {
      address: { type: String, default: "" },
      city: { type: String, default: "" },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    categoriesAccepted: {
      type: [String],
      default: ["Dairy", "Bakery", "Produce", "Grains", "Packaged Food", "Canned Food", "Other"],
    },
    maxCapacityKg: { type: Number, default: 100 },
    currentLoadKg: { type: Number, default: 0 },
    pickupAvailable: { type: Boolean, default: true },
    urgencyNeed: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },
    contactName: { type: String, default: "" },
    contactPhone: { type: String, default: "" },
    contactEmail: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ngoSchema.virtual("capacityAvailable").get(function capacityAvailable() {
  return Math.max(this.maxCapacityKg - this.currentLoadKg, 0);
});
ngoSchema.set("toJSON", { virtuals: true });
ngoSchema.set("toObject", { virtuals: true });

export default mongoose.model("NGO", ngoSchema);
