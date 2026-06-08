import googleSheetsService from "../services/googleSheets.js";

export const getSequencePipeline = async (req, res) => {
  try {
    const pipeline = await googleSheetsService.getSequencePipeline();
    res.json(pipeline);
  } catch (error) {
    console.error("Error in getSequencePipeline:", error);
    res.status(500).json({ error: error.message });
  }
};
