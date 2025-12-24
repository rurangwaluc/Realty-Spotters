import mongoose from "mongoose";

const neighborhoodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    city: { type: String, default: "Kigali" },

    rentRange: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
    },

    lifestyleScores: {
      quiet: Number,
      family: Number,
      nightlife: Number,
      commute: Number,
    },

    typicalBedrooms: {
      type: [Number],
      default: [],
    },

    description: String,
  },
  { timestamps: true }
);

export default mongoose.model("Neighborhood", neighborhoodSchema);
