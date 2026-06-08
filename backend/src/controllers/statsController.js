import googleSheetsService from "../services/googleSheets.js";

export const getDashboardStats = async (req, res) => {
  try {
    const stats = await googleSheetsService.getDashboardStats();
    res.json(stats);
  } catch (error) {
    console.error("Error in getDashboardStats:", error);
    res.status(500).json({ error: error.message });
  }
};
