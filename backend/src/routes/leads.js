import express from "express";
import {
  getAllLeads,
  createLead,
  getLeadById,
  getUnsubscribedLeads,
} from "../controllers/leadsController.js";
import { importCSV } from "../controllers/csvImportController.js";
import multer from "multer";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const isCSV =
      file.mimetype === "text/csv" ||
      file.mimetype === "application/vnd.ms-excel" ||
      file.originalname.toLowerCase().endsWith(".csv");
    callback(isCSV ? null : new Error("Only CSV files are accepted"), isCSV);
  },
});

router.get("/", getAllLeads);
router.post("/", createLead);
router.get("/unsubscribed", getUnsubscribedLeads);
router.post("/import-csv", upload.single("file"), importCSV);
router.get("/:id", getLeadById);

export default router;
