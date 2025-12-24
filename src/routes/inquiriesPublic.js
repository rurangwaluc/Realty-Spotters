import express from "express";
import Inquiry from "../models/Inquiry.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!email || !message) {
    return res.status(400).json({
      message: "Email and message are required",
    });
  }

  await Inquiry.create({
    name,
    email,
    phone,
    message,
  });

  res.json({ success: true });
});

export default router;
