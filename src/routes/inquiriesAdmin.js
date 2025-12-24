import Inquiry from "../models/Inquiry.js";
import { adminAuth } from "../middleware/adminAuth.js";
import express from "express";

const router = express.Router();

router.get("/", adminAuth, async (req, res) => {
  const inquiries = await Inquiry.find().sort({ createdAt: -1 });
  res.json(inquiries);
});

router.patch("/:id/status", adminAuth, async (req, res) => {
  const { status } = req.body;

  await Inquiry.findByIdAndUpdate(req.params.id, { status });
  res.json({ success: true });
});

export default router;
