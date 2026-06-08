import express from "express";
import {
  getAnalytics,
  getStatusBreakdown,
  getIndustryDistribution,
  getSenderPerformance,
} from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/", getAnalytics);
router.get("/status-breakdown", getStatusBreakdown);
router.get("/industry-distribution", getIndustryDistribution);
router.get("/sender-performance", getSenderPerformance);

export default router;
