import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

export const adminAuth = async (req, res, next) => {
  const token = req.headers["x-admin-token"];
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);

    const admin = await Admin.findById(decoded.adminId);
    if (!admin || !admin.active) {
      return res.status(401).json({ message: "Admin access revoked" });
    }

    req.admin = admin;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
