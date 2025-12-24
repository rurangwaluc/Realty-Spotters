import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    phone: String,
    message: String,

    source: {
      type: String,
      default: "website",
    },

    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "closed"],
      default: "new",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Inquiry", inquirySchema);
