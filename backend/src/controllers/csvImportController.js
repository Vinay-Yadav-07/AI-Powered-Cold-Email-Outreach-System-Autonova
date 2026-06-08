import csvImportService from '../services/csvImportService.js';

export const importCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await csvImportService.importCSV(req.file.buffer, req.file.originalname);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Import CSV Error:', error);
    res.status(500).json({
      error: 'Failed to import CSV',
      message: error.message,
    });
  }
};
