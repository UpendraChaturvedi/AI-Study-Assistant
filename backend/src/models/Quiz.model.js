import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  explanation: { type: String, required: true },
});

const quizSchema = new mongoose.Schema(
  {
    quizId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    sessionRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudySession',
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard', 'Interview'],
      default: 'Medium',
    },
    questions: [questionSchema],
  },
  {
    timestamps: true,
  }
);

export const Quiz = mongoose.model('Quiz', quizSchema);
