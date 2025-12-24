import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";
import dotenv from "dotenv";

dotenv.config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = "realtyspotters@gmail.com";
    const password = "supersecret123";

    const passwordHash = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      email,
      passwordHash,
    });

    console.log("✅ Admin created:", admin.email);
    process.exit();
  } catch (err) {
    console.error("❌ Error creating admin:", err);
    process.exit(1);
  }
}

createAdmin();
