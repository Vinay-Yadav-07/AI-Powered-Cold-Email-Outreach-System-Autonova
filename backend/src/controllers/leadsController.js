import googleSheetsService from "../services/googleSheets.js";
import axios from "axios";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const getAllLeads = async (req, res) => {
  try {
    const leads = await googleSheetsService.getAllLeads();

    // Apply filters if provided
    let filtered = leads;

    if (req.query.status) {
      filtered = filtered.filter((l) => l.status === req.query.status);
    }

    if (req.query.industry) {
      filtered = filtered.filter((l) => l.industry === req.query.industry);
    }

    if (req.query.sender_account) {
      filtered = filtered.filter(
        (l) => l.sender_account === req.query.sender_account,
      );
    }

    if (req.query.search) {
      const search = req.query.search.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          (l.first_name || "").toLowerCase().includes(search) ||
          (l.company || "").toLowerCase().includes(search) ||
          (l.email || "").toLowerCase().includes(search),
      );
    }

    // Pagination
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const paginated = filtered.slice(skip, skip + limit);

    res.json({
      data: paginated,
      pagination: {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
      },
    });
  } catch (error) {
    console.error("Error in getAllLeads:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getLeadById = async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await googleSheetsService.getLeadById(id);
    res.json(lead);
  } catch (error) {
    console.error("Error in getLeadById:", error);
    res.status(404).json({ error: error.message });
  }
};

export const createLead = async (req, res) => {
  const lead = {
    first_name: String(req.body.first_name || ""),
    company: String(req.body.company || ""),
    email: String(req.body.email || ""),
    industry: String(req.body.industry || ""),
    notes: String(req.body.notes || ""),
    sender_account: String(req.body.sender_account || ""),
  };

  const missingFields = ["first_name", "company", "email", "industry"].filter(
    (field) => !lead[field].trim(),
  );

  if (missingFields.length > 0) {
    return res.status(400).json({
      error: `Missing required fields: ${missingFields.join(", ")}`,
    });
  }

  if (!EMAIL_PATTERN.test(lead.email.trim())) {
    return res.status(400).json({ error: "Enter a valid email address" });
  }

  try {
    const createdLead = await googleSheetsService.addLead(lead);
    let n8nTriggered = false;

    if (process.env.N8N_WEBHOOK_URL) {
      try {
        const webhookResponse = await axios.post(
          process.env.N8N_WEBHOOK_URL,
          {
            source: "dashboard",
            lead: createdLead,
            timestamp: new Date().toISOString(),
          },
          { timeout: 15000 },
        );
        n8nTriggered =
          webhookResponse.status >= 200 && webhookResponse.status < 300;
      } catch (webhookError) {
        console.warn(
          "n8n webhook call failed after lead creation:",
          webhookError.message,
        );
      }
    }

    return res.status(201).json({
      data: createdLead,
      n8nTriggered,
      message: n8nTriggered
        ? "Lead added and workflow triggered"
        : "Lead added; workflow trigger was not confirmed",
    });
  } catch (error) {
    console.error("Error in createLead:", error);
    return res.status(error.status || 500).json({ error: error.message });
  }
};

export const getUnsubscribedLeads = async (req, res) => {
  try {
    const unsubscribed = await googleSheetsService.getUnsubscribedLeads();

    // Pagination
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const paginated = unsubscribed.slice(skip, skip + limit);

    res.json({
      data: paginated,
      pagination: {
        page,
        limit,
        total: unsubscribed.length,
        totalPages: Math.ceil(unsubscribed.length / limit),
      },
    });
  } catch (error) {
    console.error("Error in getUnsubscribedLeads:", error);
    res.status(500).json({ error: error.message });
  }
};
