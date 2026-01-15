import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";
import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // 2️⃣ Validate env vars (CRITICAL)
    if (!process.env.ADMIN_JWT_SECRET) {
      console.error("ADMIN_JWT_SECRET is missing");
      return res.status(500).json({
        message: "Server configuration error"
      });
    }

    // 3️⃣ Find admin
    const admin = await Admin.findOne({ email, active: true });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 4️⃣ Verify password
    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 5️⃣ Sign JWT (SAFE)
    const token = jwt.sign(
      { adminId: admin._id, role: admin.role },
      process.env.ADMIN_JWT_SECRET,
      { expiresIn: "2h" }
    );

    // 6️⃣ Respond with JSON
    return res.json({ token });

  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
});

export default router;
