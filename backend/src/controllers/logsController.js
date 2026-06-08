import googleSheetsService from "../services/googleSheets.js";

export const getActivityLogs = async (req, res) => {
  try {
    const leads = await googleSheetsService.getAllLeads();

    // Generate activity logs from lead data
    const logs = [];
    const logMap = new Map();

    leads.forEach((lead) => {
      const baseLog = {
        id: `${lead.id}-${lead.status}`,
        lead_id: lead.id,
        lead_name: lead.first_name,
        email: lead.email,
        timestamp: lead.last_sent_at || new Date().toISOString(),
      };

      if (lead.status === "sent_step_1" && lead.last_sent_at) {
        logs.push({
          ...baseLog,
          type: "EMAIL_SENT",
          description: `Email sent to ${lead.first_name} at ${lead.email}`,
          severity: "info",
        });
      }

      if (lead.status === "sent_followup_1" && lead.followup_count > 0) {
        logs.push({
          ...baseLog,
          id: `${lead.id}-followup`,
          type: "FOLLOWUP_SENT",
          description: `Follow-up email sent to ${lead.first_name}`,
          severity: "info",
        });
      }

      if (lead.status === "invalid_email") {
        logs.push({
          ...baseLog,
          id: `${lead.id}-invalid`,
          type: "INVALID_EMAIL",
          description: `Invalid email detected: ${lead.validation_reason || "Unknown reason"}`,
          severity: "warning",
        });
      }

      if (lead.status === "bounced") {
        logs.push({
          ...baseLog,
          id: `${lead.id}-bounce`,
          type: "BOUNCE_DETECTED",
          description: `Email bounced for ${lead.first_name}`,
          severity: "error",
        });
      }

      if (lead.last_response === "unsubscribed") {
        logs.push({
          ...baseLog,
          id: `${lead.id}-unsubscribe`,
          type: "UNSUBSCRIBED",
          description: `${lead.first_name} unsubscribed`,
          severity: "warning",
        });
      }
    });

    // Remove duplicates and sort by timestamp
    const uniqueLogs = Array.from(new Map(logs.map((l) => [l.id, l])).values());
    uniqueLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Pagination
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const paginated = uniqueLogs.slice(skip, skip + limit);

    res.json({
      data: paginated,
      pagination: {
        page,
        limit,
        total: uniqueLogs.length,
        totalPages: Math.ceil(uniqueLogs.length / limit),
      },
    });
  } catch (error) {
    console.error("Error in getActivityLogs:", error);
    res.status(500).json({ error: error.message });
  }
};
