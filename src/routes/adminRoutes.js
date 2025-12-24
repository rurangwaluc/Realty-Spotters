import express from "express";
import { getAdminStats, getAdminStatsByDate } from "../controllers/adminController.js";
import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

router.get("/analytics", adminAuth, getAdminStats);
router.get("/analytics-by-date", adminAuth, getAdminStatsByDate);


export default router;
