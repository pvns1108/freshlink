import mongoose from "mongoose";

const temperatureReadingSchema = new mongoose.Schema(
  {
    foodItem: { type: mongoose.Schema.Types.ObjectId, ref: "FoodItem" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    temperatureC: { type: Number, required: true },
    recordedAt: { type: Date, default: Date.now },
    excursion: { type: Boolean, default: false },
    source: { type: String, enum: ["simulated", "manual", "sensor"], default: "simulated" },
  },
  { timestamps: true }
);

export default mongoose.model("TemperatureReading", temperatureReadingSchema);
