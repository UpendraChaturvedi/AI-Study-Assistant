import { GoogleGenAI } from '@google/genai';

/**
 * Initialize Google GenAI Client using process.env.GEMINI_API_KEY
 */
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.warn('[Gemini Service Warning] GEMINI_API_KEY is not configured in backend/.env');
  }
  return new GoogleGenAI({ apiKey: apiKey || '' });
};

/**
 * Cleans markdown code block formatting (```json ... ```) from JSON string before parsing
 */
function sanitizeJsonString(str) {
  if (!str) return '{}';
  let cleaned = str.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim();
  }
  return cleaned;
}

/**
 * Executes a Gemini model request with strict JSON output configuration using gemini-3.6-flash
 */
async function callGeminiJson(prompt, modelName = 'gemini-3.6-flash') {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const textOutput = response.text || response.response?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textOutput) {
      throw new Error('Empty response received from Gemini API');
    }

    const sanitized = sanitizeJsonString(textOutput);
    return JSON.parse(sanitized);
  } catch (error) {
    console.error(`[Gemini Service Error (${modelName})]:`, error.message);
    throw error;
  }
}

/**
 * Generates comprehensive markdown notes and key point summary from transcript segment & video title in English or Hindi
 */
export const generateNotesAndSummary = async (transcript, videoTitle = '', targetLanguage = 'English') => {
  const langInstruction = targetLanguage === 'Hindi'
    ? 'IMPORTANT: Write ALL summary, notes, and keyTakeaways in clear HINDI (हिंदी) language with English technical terms in parentheses.'
    : 'Write ALL summary, notes, and keyTakeaways in clear ENGLISH language.';

  const prompt = `
You are an expert AI tutor specializing in creating high-yield educational study materials.
Analyze the following YouTube video content for "${videoTitle || 'Educational Video'}" and return a strict JSON object with:
1. "summary": A concise 3-5 sentence summary of the core concepts presented in this video segment.
2. "notes": A comprehensive, beautifully formatted Markdown study document with headings (H2, H3), bullet points, bold key terms, definitions, and code/math snippets if applicable.
3. "keyTakeaways": An array of 3 to 6 key actionable takeaways.

Language Requirement: ${langInstruction}

Video Title: "${videoTitle}"
Transcript Segment:
"""
${transcript}
"""
`;

  return await callGeminiJson(prompt);
};

/**
 * Generates multiple-choice quiz questions based on transcript segment & video title in English or Hindi
 */
export const generateQuiz = async (transcript, count = 5, difficulty = 'Medium', videoTitle = '', targetLanguage = 'English') => {
  const langInstruction = targetLanguage === 'Hindi'
    ? 'IMPORTANT: Write ALL quiz questions, option choices, and explanations in HINDI (हिंदी) language.'
    : 'Write ALL quiz questions, option choices, and explanations in ENGLISH language.';

  const prompt = `
You are an educational assessment creator. Generate ${count} multiple-choice quiz questions at "${difficulty}" difficulty level based on the video "${videoTitle}" and transcript segment provided.

Language Requirement: ${langInstruction}

Return a strict JSON object structured as:
{
  "questions": [
    {
      "questionId": "q1",
      "text": "Clear, concise question statement related to ${videoTitle || 'the video topic'}",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Exact text of the correct option",
      "explanation": "Detailed explanation of why this answer is correct and others are incorrect."
    }
  ]
}

Video Title: "${videoTitle}"
Transcript Segment:
"""
${transcript}
"""
`;

  return await callGeminiJson(prompt);
};

/**
 * Generates interactive study flashcards (Q&A pairs) in English or Hindi
 */
export const generateFlashcards = async (transcript, videoTitle = '', targetLanguage = 'English') => {
  const langInstruction = targetLanguage === 'Hindi'
    ? 'IMPORTANT: Write ALL flashcard questions and answers in HINDI (हिंदी) language.'
    : 'Write ALL flashcard questions and answers in ENGLISH language.';

  const prompt = `
Create 5 to 8 high-yield active recall flashcards based on the video "${videoTitle}" and transcript segment.

Language Requirement: ${langInstruction}

Return a strict JSON object structured as:
{
  "flashcards": [
    {
      "question": "Clear, direct question focusing on a single key concept from ${videoTitle || 'the video'}",
      "answer": "Concise, accurate answer"
    }
  ]
}

Video Title: "${videoTitle}"
Transcript Segment:
"""
${transcript}
"""
`;

  return await callGeminiJson(prompt);
};

/**
 * Generates a concept mind map dynamically formatted for React Flow graph rendering in English or Hindi
 */
export const generateMindMap = async (transcript, videoTitle = '', targetLanguage = 'English') => {
  const langInstruction = targetLanguage === 'Hindi'
    ? 'Write concept node labels in clear HINDI (हिंदी) or Hinglish.'
    : 'Write concept node labels in clear ENGLISH.';

  const prompt = `
Analyze the video content for "${videoTitle}" and transcript segment to extract the core hierarchy of concepts to form a Mind Map graph.
Return a strict JSON object with nodes and edges formatted specifically for React Flow rendering:

Language Requirement: ${langInstruction}

{
  "nodes": [
    {
      "id": "1",
      "type": "default",
      "data": { "label": "${videoTitle || 'Central Topic'}", "description": "Core concepts" },
      "position": { "x": 250, "y": 50 }
    },
    {
      "id": "2",
      "type": "default",
      "data": { "label": "Key Concept A", "description": "Details" },
      "position": { "x": 100, "y": 180 }
    },
    {
      "id": "3",
      "type": "default",
      "data": { "label": "Key Concept B", "description": "Details" },
      "position": { "x": 400, "y": 180 }
    }
  ],
  "edges": [
    { "id": "e1-2", "source": "1", "target": "2", "label": "includes", "animated": true },
    { "id": "e1-3", "source": "1", "target": "3", "label": "leads to", "animated": true }
  ]
}

Video Title: "${videoTitle}"
Transcript Segment:
"""
${transcript}
"""
`;

  return await callGeminiJson(prompt);
};
