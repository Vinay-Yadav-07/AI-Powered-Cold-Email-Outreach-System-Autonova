import express from 'express';
import { getSequencePipeline } from '../controllers/sequencesController.js';

const router = express.Router();

router.get('/', getSequencePipeline);

export default router;
