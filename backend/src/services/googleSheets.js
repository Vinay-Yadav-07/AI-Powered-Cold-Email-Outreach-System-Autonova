import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

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

const isConfigError = (error) => {
  return (
    error.message?.startsWith("Missing Google Sheets configuration") ||
    error.message?.startsWith("Replace placeholder Google Sheets configuration")
  );
};

class GoogleSheetsService {
  constructor() {
    this.sheets = google.sheets("v4");
    this.auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: normalizePrivateKey(process.env.GOOGLE_PRIVATE_KEY),
        type: "service_account",
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    this.spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  }

  async getAuthClient() {
    const missing = [
      ["GOOGLE_CLIENT_EMAIL", process.env.GOOGLE_CLIENT_EMAIL],
      ["GOOGLE_PRIVATE_KEY", process.env.GOOGLE_PRIVATE_KEY],
      ["GOOGLE_SHEETS_ID", this.spreadsheetId],
    ]
      .filter(([, value]) => !value)
      .map(([key]) => key);

    if (missing.length > 0) {
      throw new Error(`Missing Google Sheets configuration: ${missing.join(", ")}`);
    }

    const placeholders = [
      ["GOOGLE_CLIENT_EMAIL", process.env.GOOGLE_CLIENT_EMAIL],
      ["GOOGLE_PRIVATE_KEY", process.env.GOOGLE_PRIVATE_KEY],
      ["GOOGLE_SHEETS_ID", this.spreadsheetId],
    ]
      .filter(([, value]) => isPlaceholder(value))
      .map(([key]) => key);

    if (placeholders.length > 0) {
      throw new Error(
        `Replace placeholder Google Sheets configuration: ${placeholders.join(", ")}`,
      );
    }

    return await this.auth.getClient();
  }

  async getAllLeads() {
    try {
      const authClient = await this.getAuthClient();
      const request = {
        spreadsheetId: this.spreadsheetId,
        range: "Leads!A2:M",
        auth: authClient,
      };

      const response = await this.sheets.spreadsheets.values.get(request);
      const rows = response.data.values || [];

      return rows.map((row) => ({
        id: row[0],
        first_name: row[1],
        company: row[2],
        email: row[3],
        industry: row[4],
        status: row[5],
        last_sent_at: row[6],
        last_email_content: row[7],
        followup_count: parseInt(row[8]) || 0,
        last_response: row[9],
        notes: row[10],
        sender_account: row[11],
        validation_reason: row[12],
      }));
    } catch (error) {
      console.error("Error fetching leads:", error);
      if (isConfigError(error)) {
        throw error;
      }
      throw new Error("Failed to fetch leads from Google Sheets");
    }
  }

  async getLeadById(id) {
    try {
      const authClient = await this.getAuthClient();
      const request = {
        spreadsheetId: this.spreadsheetId,
        range: "Leads!A2:M",
        auth: authClient,
      };

      const response = await this.sheets.spreadsheets.values.get(request);
      const rows = response.data.values || [];

      const row = rows.find((r) => r[0] === id);
      if (!row) {
        throw new Error("Lead not found");
      }

      return {
        id: row[0],
        first_name: row[1],
        company: row[2],
        email: row[3],
        industry: row[4],
        status: row[5],
        last_sent_at: row[6],
        last_email_content: row[7],
        followup_count: parseInt(row[8]) || 0,
        last_response: row[9],
        notes: row[10],
        sender_account: row[11],
        validation_reason: row[12],
      };
    } catch (error) {
      console.error("Error fetching lead:", error);
      if (isConfigError(error)) {
        throw error;
      }
      throw new Error("Failed to fetch lead from Google Sheets");
    }
  }

  async addLead(lead) {
    try {
      const authClient = await this.getAuthClient();
      const existingLeads = await this.getAllLeads();
      const normalizedEmail = lead.email.trim().toLowerCase();

      if (
        existingLeads.some(
          (existingLead) =>
            (existingLead.email || "").trim().toLowerCase() === normalizedEmail,
        )
      ) {
        const error = new Error("A lead with this email already exists");
        error.status = 409;
        throw error;
      }

      const newLead = {
        id: `lead_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        first_name: lead.first_name.trim(),
        company: lead.company.trim(),
        email: normalizedEmail,
        industry: lead.industry.trim(),
        status: "queued",
        last_sent_at: "",
        last_email_content: "",
        followup_count: 0,
        last_response: "",
        notes: (lead.notes || "").trim(),
        sender_account: (lead.sender_account || "").trim(),
        validation_reason: "",
      };

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: "Leads!A:M",
        valueInputOption: "USER_ENTERED",
        insertDataOption: "INSERT_ROWS",
        requestBody: {
          values: [
            [
              newLead.id,
              newLead.first_name,
              newLead.company,
              newLead.email,
              newLead.industry,
              newLead.status,
              newLead.last_sent_at,
              newLead.last_email_content,
              newLead.followup_count,
              newLead.last_response,
              newLead.notes,
              newLead.sender_account,
              newLead.validation_reason,
            ],
          ],
        },
        auth: authClient,
      });

      return newLead;
    } catch (error) {
      console.error("Error adding lead:", error);
      if (isConfigError(error) || error.status) {
        throw error;
      }
      throw new Error("Failed to add lead to Google Sheets");
    }
  }

  async getDashboardStats() {
    try {
      const leads = await this.getAllLeads();

      const stats = {
        totalLeads: leads.length,
        emailsSent: leads.filter(
          (l) => l.status === "sent_step_1" || l.status === "sent_followup_1" || l.status === "bounced",
        ).length,
        followupsSent: leads.filter((l) => l.status === "sent_followup_1")
          .length,
        invalidEmails: leads.filter((l) => l.status === "invalid_email").length,
        bouncedEmails: leads.filter((l) => l.status === "bounced").length,
        unsubscribedLeads: leads.filter(
          (l) => l.last_response === "unsubscribed",
        ).length,
        activeSenderAccounts: [
          ...new Set(leads.map((l) => l.sender_account).filter(Boolean)),
        ].length,
        queuedLeads: leads.filter((l) => l.status === "queued").length,
      };

      return stats;
    } catch (error) {
      console.error("Error calculating dashboard stats:", error);
      throw error;
    }
  }

  async getLeadsStatusBreakdown() {
    try {
      const leads = await this.getAllLeads();

      const breakdown = {
        queued: leads.filter((l) => l.status === "queued" && l.last_response !== "unsubscribed").length,
        sent_step_1: leads.filter((l) => l.status === "sent_step_1" && l.last_response !== "unsubscribed").length,
        sent_followup_1: leads.filter((l) => l.status === "sent_followup_1" && l.last_response !== "unsubscribed").length,
        invalid_email: leads.filter((l) => l.status === "invalid_email" && l.last_response !== "unsubscribed").length,
        bounced: leads.filter((l) => l.status === "bounced" && l.last_response !== "unsubscribed").length,
        unsubscribed: leads.filter((l) => l.last_response === "unsubscribed").length,
      };

      return breakdown;
    } catch (error) {
      console.error("Error calculating status breakdown:", error);
      throw error;
    }
  }

  async getIndustryDistribution() {
    try {
      const leads = await this.getAllLeads();
      const distribution = {};

      leads.forEach((lead) => {
        const industry = lead.industry || "Unknown";
        distribution[industry] = (distribution[industry] || 0) + 1;
      });

      return distribution;
    } catch (error) {
      console.error("Error calculating industry distribution:", error);
      throw error;
    }
  }

  async getSenderPerformance() {
    try {
      const leads = await this.getAllLeads();
      const performance = {};

      leads.forEach((lead) => {
        const sender = lead.sender_account || "Unknown";
        if (!performance[sender]) {
          performance[sender] = {
            total: 0,
            sent: 0,
            followed_up: 0,
            bounced: 0,
            unsubscribed: 0,
          };
        }

        performance[sender].total += 1;
        if (lead.status === "sent_step_1") performance[sender].sent += 1;
        if (lead.status === "sent_followup_1")
          performance[sender].followed_up += 1;
        if (lead.status === "bounced") performance[sender].bounced += 1;
        if (lead.last_response === "unsubscribed")
          performance[sender].unsubscribed += 1;
      });

      return performance;
    } catch (error) {
      console.error("Error calculating sender performance:", error);
      throw error;
    }
  }

  async getUnsubscribedLeads() {
    try {
      const leads = await this.getAllLeads();
      return leads.filter((l) => l.last_response === "unsubscribed");
    } catch (error) {
      console.error("Error fetching unsubscribed leads:", error);
      throw error;
    }
  }

  async getSequencePipeline() {
    try {
      const leads = await this.getAllLeads();

      return {
        queued: leads.filter((l) => l.status === "queued" && l.last_response !== "unsubscribed").length,
        sent_step_1: leads.filter((l) => l.status === "sent_step_1" && l.last_response !== "unsubscribed").length,
        sent_followup_1: leads.filter((l) => l.status === "sent_followup_1" && l.last_response !== "unsubscribed").length,
        unsubscribed: leads.filter((l) => l.last_response === "unsubscribed").length,
      };
    } catch (error) {
      console.error("Error calculating sequence pipeline:", error);
      throw error;
    }
  }
}

export default new GoogleSheetsService();
