import mongoose from 'mongoose';

const flashcardSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
});

const mindMapNodeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, default: 'default' },
  data: {
    label: { type: String, required: true },
    description: { type: String },
  },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
});

const mindMapEdgeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  source: { type: String, required: true },
  target: { type: String, required: true },
  label: { type: String },
  animated: { type: Boolean, default: true },
});

const studySessionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: 'anonymous_user',
    },
    videoId: {
      type: String,
      required: [true, 'YouTube Video ID is required'],
      index: true,
    },
    videoTitle: {
      type: String,
      default: 'Untitled Educational Video',
    },
    startTime: {
      type: Number, // Seconds
      required: true,
      default: 0,
    },
    endTime: {
      type: Number, // Seconds
      required: true,
    },
    notes: {
      type: String, // Rich Markdown format
      default: '',
    },
    summary: {
      type: String,
      default: '',
    },
    flashcards: [flashcardSchema],
    mindMap: {
      nodes: [mindMapNodeSchema],
      edges: [mindMapEdgeSchema],
    },
  },
  {
    timestamps: true,
  }
);

export const StudySession = mongoose.model('StudySession', studySessionSchema);
