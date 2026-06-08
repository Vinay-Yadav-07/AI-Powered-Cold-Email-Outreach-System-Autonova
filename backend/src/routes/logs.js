import express from "express";
import { getActivityLogs } from "../controllers/logsController.js";

const router = express.Router();

router.get("/", getActivityLogs);

export default router;
