// src/models/SearchLog.js
import mongoose from "mongoose";

const searchLogSchema = new mongoose.Schema(
  {
    budget: Number,
    bedrooms: Number,
    priority: String,
    resultsCount: Number,
  },
  { timestamps: true }
);

export default mongoose.model("SearchLog", searchLogSchema);
