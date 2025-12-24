import PaymentIntent from "../models/PaymentIntent.js";
import SearchLog from "../models/SearchLog.js";
import crypto from "crypto";

export const initiatePayment = async (req, res) => {
  try {
    const { searchLogId, phoneNumber, provider } = req.body;

    if (
      !searchLogId ||
      !phoneNumber ||
      !["momo", "esicia"].includes(provider)
    ) {
      return res.status(400).json({
        message: "Invalid payment request",
      });
    }

    const searchLog = await SearchLog.findById(searchLogId);
    if (!searchLog) {
      return res.status(404).json({ message: "Search log not found" });
    }

    const reference = `RS-${crypto.randomUUID()}`;
    const amount = 2000; // RWF (business rule)

    const intent = await PaymentIntent.create({
      reference,
      amount,
      provider,
      phoneNumber,
      searchLogId,
    });

    /**
     * IMPORTANT:
     * No real API call yet.
     * MTN MoMo / Esicia integration happens in D2.
     */

    res.json({
      reference: intent.reference,
      amount: intent.amount,
      currency: intent.currency,
      provider: intent.provider,
      phoneNumber: intent.phoneNumber,
      status: intent.status,
      message:
        "Payment request created. Awaiting mobile money confirmation.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
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
