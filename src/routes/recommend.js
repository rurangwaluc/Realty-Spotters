
import express from "express";
import {
  recommendNeighborhoods,
  unlockRecommendations,
} from "../controllers/recommendController.js";

const router = express.Router();

router.post("/", recommendNeighborhoods);
router.post("/unlock", unlockRecommendations);

export default router;

