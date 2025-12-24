import mongoose from "mongoose";

const paymentIntentSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
      required: true,
      unique: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "RWF",
    },

    provider: {
      type: String,
      enum: ["momo", "esicia"],
      required: true,
    },

    phoneNumber: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    searchLogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SearchLog",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("PaymentIntent", paymentIntentSchema);
