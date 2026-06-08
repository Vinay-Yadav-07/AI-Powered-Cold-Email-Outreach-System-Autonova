import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import { parse } from "csv-parse/sync";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const LEAD_COLUMNS = [
  "id",
  "first_name",
  "company",
  "email",
  "industry",
  "status",
  "last_sent_at",
  "last_email_content",
  "followup_count",
  "last_response",
  "notes",
  "sender_account",
  "validation_reason",
];
const REQUIRED_COLUMNS = ["first_name", "company", "email", "industry"];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeHeader = (header) => header.toLowerCase().trim();

const normalizeRecord = (record) => {
  return Object.entries(record).reduce((normalized, [key, value]) => {
    normalized[normalizeHeader(key)] = typeof value === "string" ? value.trim() : value;
    return normalized;
  }, {});
};

const normalizePrivateKey = (key) => {
  if (!key) return key;
  return key
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\\n/g, "\n");
};

const isPlaceholder = (value) => {
  return !value || value.toLowerCase().includes("your-");
};

const validateGoogleSheetsConfig = () => {
  const config = [
    ["GOOGLE_CLIENT_EMAIL", process.env.GOOGLE_CLIENT_EMAIL],
    ["GOOGLE_PRIVATE_KEY", process.env.GOOGLE_PRIVATE_KEY],
    ["GOOGLE_SHEETS_ID", process.env.GOOGLE_SHEETS_ID],
  ];

  const missing = config.filter(([, value]) => !value).map(([key]) => key);
  if (missing.length > 0) {
    throw new Error(`Missing Google Sheets configuration: ${missing.join(", ")}`);
  }

  const placeholders = config
    .filter(([, value]) => isPlaceholder(value))
    .map(([key]) => key);
  if (placeholders.length > 0) {
    throw new Error(
      `Replace placeholder Google Sheets configuration: ${placeholders.join(", ")}`,
    );
  }
};

const csvImportService = {
  async importCSV(fileBuffer, fileName) {
    try {
      // Parse CSV
      const records = parse(fileBuffer.toString(), {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_column_count_less: true,
      });

      if (records.length === 0) {
        throw new Error("CSV file is empty");
      }

      validateGoogleSheetsConfig();

      // Connect to Google Sheets
      const auth = new JWT({
        email: process.env.GOOGLE_CLIENT_EMAIL,
        key: normalizePrivateKey(process.env.GOOGLE_PRIVATE_KEY),
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });

      const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_ID, auth);
      await doc.loadInfo();

      const sheet = doc.sheetsByTitle["Leads"] || doc.sheetsByIndex[0];
      if (!sheet) {
        throw new Error("Leads sheet not found");
      }

      // Load the header row so google-spreadsheet knows the exact column order
      await sheet.loadHeaderRow();
      const sheetHeaders = sheet.headerValues; // e.g. ["id","first_name","company","email",...]

      const normalizedRecords = records.map(normalizeRecord);

      const csvHeaders = Object.keys(normalizedRecords[0] || {});
      const missingColumns = REQUIRED_COLUMNS.filter(
        (col) => !csvHeaders.includes(col),
      );
      if (missingColumns.length > 0) {
        throw new Error(
          `CSV is missing required columns: ${missingColumns.join(", ")}`,
        );
      }

      const invalidRow = normalizedRecords.findIndex(
        (record) =>
          REQUIRED_COLUMNS.some((column) => !record[column]) ||
          !EMAIL_PATTERN.test(record.email || ""),
      );
      if (invalidRow !== -1) {
        throw new Error(
          `CSV row ${invalidRow + 2} has a missing required value or invalid email`,
        );
      }

      // Import each row
      let importedCount = 0;
      let failedCount = 0;

      for (const record of normalizedRecords) {
        try {
          // Build a complete rowData object with all required fields
          const rowData = {
            id: record.id || `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            first_name: record.first_name || "",
            company: record.company || "",
            email: record.email || "",
            industry: record.industry || "",
            status: record.status || "queued",
            last_sent_at: record.last_sent_at || "",
            last_email_content: record.last_email_content || "",
            followup_count: parseInt(record.followup_count) || 0,
            last_response: record.last_response || "",
            notes: record.notes || "",
            sender_account: record.sender_account || "",
            validation_reason: record.validation_reason || "",
          };

          // Build an array ordered exactly by the sheet's header row
          // This ensures values land in the correct columns regardless of key order
          const rowArray = sheetHeaders.map((header) => {
            const key = header.toLowerCase().trim();
            return rowData[key] !== undefined ? String(rowData[key]) : "";
          });

          await sheet.addRow(rowArray);
          importedCount++;
        } catch (rowError) {
          console.error(`Error importing row:`, rowError);
          failedCount++;
        }
      }

      // Trigger n8n webhook after import — kicks off the New Lead workflow immediately
      const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
      let n8nTriggered = false;

      if (n8nWebhookUrl && importedCount > 0) {
        try {
          const webhookRes = await axios.post(n8nWebhookUrl, {
            source: "csv_import",
            importedCount,
            fileName,
            timestamp: new Date().toISOString(),
          });
          n8nTriggered = webhookRes.status >= 200 && webhookRes.status < 300;
          console.log(`✅ n8n webhook triggered — status ${webhookRes.status}`);
        } catch (webhookErr) {
          console.warn("⚠️  n8n webhook call failed (import still succeeded):", webhookErr.message);
        }
      }

      return {
        success: true,
        fileName,
        totalRows: records.length,
        importedCount,
        failedCount,
        n8nTriggered,
        message: `Successfully imported ${importedCount} leads (${failedCount} failed)${
          n8nTriggered ? " — n8n workflow triggered" : ""
        }`,
      };
    } catch (error) {
      console.error("CSV Import Error:", error);
      throw error;
    }
  },
};

export default csvImportService;
