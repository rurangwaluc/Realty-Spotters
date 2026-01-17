import PaymentIntent from "../models/PaymentIntent.js";
import SearchLog from "../models/SearchLog.js";
import crypto from "crypto";
import mongoose from "mongoose";
import { requestMomoPayment } from "../services/momoService.js";

export const initiatePayment = async (req, res) => {
  try {
    const { searchLogId, phoneNumber, provider } = req.body;

    // 1️⃣ Validation
    if (!searchLogId || !phoneNumber || !provider) {
      return res.status(400).json({
        message: "searchLogId, phoneNumber and provider are required",
      });
    }

    if (!["momo", "esicia"].includes(provider)) {
      return res.status(400).json({
        message: "Invalid payment provider",
      });
    }

  // 2️⃣ Validate search log
      if (!mongoose.Types.ObjectId.isValid(searchLogId)) {
        return res.status(400).json({
          message: "Invalid searchLogId",
        });
      }

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

    // 4️⃣ ESICIA PAYMENT FLOW
    if (provider === "esicia") {

        // 🔍 TEMP DEBUG — REMOVE AFTER TESTING
  console.log("ESICIA ENV CHECK:", {
    env: process.env.ESICIA_ENV,
    username: process.env.ESICIA_USERNAME,
    retailer: process.env.ESICIA_RETAILER_ID,
  });
      const esiciaResponse = await initiateEsiciaPayment({
        action: "pay",
        msisdn: phoneNumber.replace("+", ""),
        email: "customer@realtyspotters.rw",
        details: "Unlock full neighborhood recommendations",
        refid: reference,
        amount,
        currency: "RWF",
        cname: "Realty Spotters User",
        cnumber: searchLogId,
        pmethod: "momo",
        retailerid: process.env.ESICIA_RETAILER_ID,
        returl: `${process.env.API_BASE_URL}/api/payments/esicia/webhook`,
        redirecturl: `${process.env.FRONTEND_URL}/payment-success`,
      });

      return res.json({
        provider: "esicia",
        reference,
        checkoutUrl: esiciaResponse.url,
        status: "pending",
      });
    }

    // 5️⃣ MTN MoMo (or sandbox) FLOW
    if (provider === "momo") {
      await requestMomoPayment({
        phoneNumber,
        amount,
        reference,
      });

      return res.json({
        provider: "momo",
        reference: payment.reference,
        amount: payment.amount,
        currency: payment.currency,
        phoneNumber: payment.phoneNumber,
        status: payment.status,
        message:
          "Payment request sent. Please confirm on your phone.",
      });
    }
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


//


export const esiciaWebhook = async (req, res) => {
  try {
    /**
     * ESICIA sends a POST with transaction details
     * We trust ESICIA IP + credentials (configured separately)
     */

    const {
      refid,        // our reference (RS-xxxx)
      status,       // SUCCESS / FAILED
      amount,
      msisdn,
    } = req.body;

    console.log("📥 ESICIA WEBHOOK RECEIVED:", req.body);

    if (!refid || !status) {
      return res.status(400).json({
        message: "Invalid webhook payload",
      });
    }

    const payment = await PaymentIntent.findOne({ reference: refid });

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    // Ignore duplicate callbacks
    if (payment.status === "paid") {
      return res.json({ message: "Already processed" });
    }

    if (status === "SUCCESS") {
      payment.status = "paid";
      payment.providerResponse = req.body;
      await payment.save();

      console.log("✅ ESICIA PAYMENT CONFIRMED:", refid);

      return res.json({
        message: "Payment confirmed",
      });
    }

    // Failed payment
    payment.status = "failed";
    payment.providerResponse = req.body;
    await payment.save();

    return res.json({
      message: "Payment marked as failed",
    });
  } catch (err) {
    console.error("❌ ESICIA WEBHOOK ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

