import googleSheetsService from "../services/googleSheets.js";

export const getAnalytics = async (req, res) => {
  try {
    const [statusBreakdown, industryDistribution, senderPerformance] =
      await Promise.all([
        googleSheetsService.getLeadsStatusBreakdown(),
        googleSheetsService.getIndustryDistribution(),
        googleSheetsService.getSenderPerformance(),
      ]);

    res.json({
      statusBreakdown,
      industryDistribution,
      senderPerformance,
    });
  } catch (error) {
    console.error("Error in getAnalytics:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getStatusBreakdown = async (req, res) => {
  try {
    const breakdown = await googleSheetsService.getLeadsStatusBreakdown();
    res.json(breakdown);
  } catch (error) {
    console.error("Error in getStatusBreakdown:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getIndustryDistribution = async (req, res) => {
  try {
    const distribution = await googleSheetsService.getIndustryDistribution();
    res.json(distribution);
  } catch (error) {
    console.error("Error in getIndustryDistribution:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getSenderPerformance = async (req, res) => {
  try {
    const performance = await googleSheetsService.getSenderPerformance();
    res.json(performance);
  } catch (error) {
    console.error("Error in getSenderPerformance:", error);
    res.status(500).json({ error: error.message });
  }
};
