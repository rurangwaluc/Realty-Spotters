import PaymentIntent from "../models/PaymentIntent.js";
import SearchLog from "../models/SearchLog.js";
import crypto from "crypto";
import { requestMomoPayment } from "../services/momoService.js";

export const initiatePayment = async (req, res) => {
  try {
    const { searchLogId, phoneNumber, provider } = req.body;

    // 1️⃣ Validation
    if (!searchLogId || !phoneNumber) {
      return res.status(400).json({
        message: "searchLogId and phoneNumber are required",
      });
    }

    if (!["momo", "esicia"].includes(provider)) {
      return res.status(400).json({
        message: "Invalid payment provider",
      });
    }

    // 2️⃣ Validate search log
    const searchLog = await SearchLog.findById(searchLogId);
    if (!searchLog) {
      return res.status(404).json({
        message: "Search log not found",
      });
    }

    // 3️⃣ Create payment intent
    const reference = `RS-${crypto.randomUUID()}`;
    const amount = 2000;

    const payment = await PaymentIntent.create({
      reference,
      amount,
      provider,
      phoneNumber,
      searchLogId,
      status: "pending",
    });

    // 4️⃣ RESPOND ONCE (IMPORTANT)
    return res.json({
      reference: payment.reference,
      amount: payment.amount,
      currency: payment.currency,
      provider: payment.provider,
      phoneNumber: payment.phoneNumber,
      status: payment.status,
      message:
        "Payment request created. Awaiting mobile money confirmation.",
    });

  } catch (err) {
    console.error("INITIATE PAYMENT ERROR:", err);
    return res.status(500).json({
      message: "Server error",
    });
  }
};


export const confirmPayment = async (req, res) => {
  try {
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({
        message: "Payment reference is required",
      });
    }

    const payment = await PaymentIntent.findOne({ reference });

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    // Simulate MTN MoMo success
    payment.status = "paid";
    await payment.save();

    res.json({
      message: "Payment confirmed successfully",
      payment: {
        reference: payment.reference,
        status: payment.status,
        searchLogId: payment.searchLog,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const confirmPaymentSandbox = async (req, res) => {
  try {
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({
        message: "Payment reference required",
      });
    }

    const payment = await PaymentIntent.findOne({ reference });

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    payment.status = "paid";
    await payment.save();

    res.json({
      message: "Payment confirmed (sandbox)",
      reference,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

