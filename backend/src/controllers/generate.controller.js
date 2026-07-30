import { StudySession } from '../models/StudySession.model.js';
import { Quiz } from '../models/Quiz.model.js';
import {
  generateNotesAndSummary,
  generateQuiz,
  generateFlashcards,
  generateMindMap,
} from '../services/gemini.service.js';

/**
 * Controller: Generate AI Study Materials
 * Route: POST /api/generate/study-material
 */
export const generateStudyMaterial = async (req, res) => {
  try {
    const {
      transcript,
      videoId,
      videoTitle = 'Educational Video',
      startTime = 0,
      endTime = 0,
      requestTypes = ['notes', 'quiz', 'mindmap', 'flashcards'],
      difficulty = 'Medium',
      targetLanguage = 'English',
      userId = 'anonymous_user',
    } = req.body;

    if (!transcript || transcript.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Transcript content is required to generate study materials.',
      });
    }

    if (!videoId) {
      return res.status(400).json({
        success: false,
        error: 'YouTube videoId is required.',
      });
    }

    console.log(`[Generate API] Processing request for video "${videoTitle}" (${videoId}) in ${targetLanguage} [${startTime}s - ${endTime}s]...`);

    let notes = '';
    let summary = '';
    let flashcards = [];
    let mindMap = { nodes: [], edges: [] };
    let quizData = null;

    // Use Promise.allSettled to gracefully handle any individual AI worker errors
    const tasks = [];

    if (requestTypes.includes('notes')) {
      tasks.push(
        generateNotesAndSummary(transcript, videoTitle, targetLanguage).then((res) => {
          notes = res.notes || '';
          summary = res.summary || '';
        })
      );
    }

    if (requestTypes.includes('flashcards')) {
      tasks.push(
        generateFlashcards(transcript, videoTitle, targetLanguage).then((res) => {
          flashcards = res.flashcards || [];
        })
      );
    }

    if (requestTypes.includes('mindmap')) {
      tasks.push(
        generateMindMap(transcript, videoTitle, targetLanguage).then((res) => {
          mindMap = {
            nodes: res.nodes || [],
            edges: res.edges || [],
          };
        })
      );
    }

    if (requestTypes.includes('quiz')) {
      tasks.push(
        generateQuiz(transcript, 5, difficulty, videoTitle, targetLanguage).then((res) => {
          quizData = res.questions || [];
        })
      );
    }

    // Await all AI promises with allSettled
    await Promise.allSettled(tasks);

    // Save StudySession to MongoDB
    const session = new StudySession({
      userId,
      videoId,
      videoTitle,
      startTime,
      endTime,
      notes,
      summary,
      flashcards,
      mindMap,
    });

    const savedSession = await session.save();

    // Save Quiz to MongoDB if generated
    let savedQuiz = null;
    if (quizData && quizData.length > 0) {
      const quiz = new Quiz({
        quizId: `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        sessionRef: savedSession._id,
        difficulty,
        questions: quizData,
      });
      savedQuiz = await quiz.save();
    }

    console.log(`[Generate API] Successfully generated and saved session ${savedSession._id}`);

    return res.status(201).json({
      success: true,
      message: 'Study materials generated successfully',
      data: {
        session: savedSession,
        quiz: savedQuiz,
        targetLanguage,
      },
    });
  } catch (error) {
    console.error('[Generate Controller Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate study materials via Gemini AI',
    });
  }
};

/**
 * Controller: Get all saved study sessions
 * Route: GET /api/generate/sessions
 */
export const getStudySessions = async (req, res) => {
  try {
    const { videoId } = req.query;
    const filter = videoId ? { videoId } : {};

    const sessions = await StudySession.find(filter).sort({ createdAt: -1 }).limit(20);

    return res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch study sessions',
    });
  }
};

/**
 * Controller: Get single study session details
 * Route: GET /api/generate/session/:id
 */
export const getSessionById = async (req, res) => {
  try {
    const session = await StudySession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Study session not found' });
    }

    const quiz = await Quiz.findOne({ sessionRef: session._id });

    return res.status(200).json({
      success: true,
      data: {
        session,
        quiz,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch study session',
    });
  }
};
