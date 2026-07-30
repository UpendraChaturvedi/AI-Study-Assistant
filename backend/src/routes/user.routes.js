import express from 'express';
import {
  registerUser,
  loginUser,
  createUserProfile,
  submitQuizAnswers,
  getUserAnalytics,
} from '../controllers/user.controller.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/profile', createUserProfile);
router.post('/quiz-submit', submitQuizAnswers);
router.get('/analytics', getUserAnalytics);

export default router;
