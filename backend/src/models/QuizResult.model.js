import mongoose from 'mongoose';

const quizResultSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: 'anonymous_user',
      index: true,
    },
    quizId: {
      type: String,
      required: true,
    },
    sessionRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudySession',
    },
    score: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    accuracyPercentage: {
      type: Number,
      required: true,
    },
    userAnswers: [
      {
        questionId: String,
        selectedOption: String,
        correctAnswer: String,
        isCorrect: Boolean,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const QuizResult = mongoose.model('QuizResult', quizResultSchema);
