import express from 'express';
import {
  generateStudyMaterial,
  getStudySessions,
  getSessionById,
} from '../controllers/generate.controller.js';

const router = express.Router();

// POST /api/generate/study-material - Generate AI study materials from transcript
router.post('/study-material', generateStudyMaterial);

// GET /api/generate/sessions - Fetch past generated study sessions
router.get('/sessions', getStudySessions);

// GET /api/generate/session/:id - Fetch single session details with quiz
router.get('/session/:id', getSessionById);

export default router;
