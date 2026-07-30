import { User } from '../models/User.model.js';
import { Quiz } from '../models/Quiz.model.js';
import { QuizResult } from '../models/QuizResult.model.js';
import { StudySession } from '../models/StudySession.model.js';

/**
 * Controller: Register new user
 * Route: POST /api/user/register
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Account with this email already exists. Please sign in.' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password, // Simple string storage or hash
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
    });

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Controller: Sign In user
 * Route: POST /api/user/login
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Controller: Submit Quiz Answers & Calculate Score & Accuracy
 * Route: POST /api/user/quiz-submit
 */
export const submitQuizAnswers = async (req, res) => {
  try {
    const { userId = 'anonymous_user', quizId, userAnswers = [] } = req.body;

    if (!quizId) {
      return res.status(400).json({ success: false, error: 'quizId is required.' });
    }

    const quiz = await Quiz.findOne({ quizId });
    if (!quiz) {
      return res.status(404).json({ success: false, error: 'Quiz not found.' });
    }

    let score = 0;
    const evaluatedAnswers = userAnswers.map((ua) => {
      const q = quiz.questions.find((item) => item.questionId === ua.questionId);
      const isCorrect = q ? q.correctAnswer === ua.selectedOption : false;
      if (isCorrect) score += 1;

      return {
        questionId: ua.questionId,
        selectedOption: ua.selectedOption,
        correctAnswer: q ? q.correctAnswer : '',
        isCorrect,
      };
    });

    const totalQuestions = quiz.questions.length || 1;
    const accuracyPercentage = Math.round((score / totalQuestions) * 100);

    // Save result to MongoDB
    const resultDoc = new QuizResult({
      userId,
      quizId,
      sessionRef: quiz.sessionRef,
      score,
      totalQuestions,
      accuracyPercentage,
      userAnswers: evaluatedAnswers,
    });

    const savedResult = await resultDoc.save();

    return res.status(200).json({
      success: true,
      message: 'Quiz evaluated and saved successfully',
      data: {
        quizId,
        score,
        totalQuestions,
        accuracyPercentage,
        resultId: savedResult._id,
      },
    });
  } catch (error) {
    console.error('[Quiz Submit Error]:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Controller: Get User Analytics Dashboard Data
 * Route: GET /api/user/analytics
 */
export const getUserAnalytics = async (req, res) => {
  try {
    const userId = req.query.userId || 'anonymous_user';

    const totalSessions = await StudySession.countDocuments({ userId });
    const quizResults = await QuizResult.find({ userId }).sort({ createdAt: -1 });

    const totalQuizzes = quizResults.length;
    const avgAccuracy =
      totalQuizzes > 0
        ? Math.round(quizResults.reduce((acc, curr) => acc + curr.accuracyPercentage, 0) / totalQuizzes)
        : 0;

    return res.status(200).json({
      success: true,
      data: {
        userId,
        totalSessions,
        totalQuizzes,
        avgAccuracy,
        recentResults: quizResults.slice(0, 10),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const createUserProfile = async (req, res) => {
  try {
    const { name, email, settings } = req.body;
    let user = await User.findOne({ email });

    if (user) {
      user.name = name || user.name;
      if (settings) user.settings = { ...user.settings, ...settings };
      await user.save();
    } else {
      user = await User.create({ name, email, settings });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
