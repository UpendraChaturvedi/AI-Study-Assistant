import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

async function testGenerate() {
  try {
    console.log('Testing gemini-3.6-flash...');
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: 'Hello, return a json object with key message.',
      config: {
        responseMimeType: 'application/json',
      },
    });
    console.log('SUCCESS Response text:', response.text);
  } catch (err) {
    console.error('Error with gemini-3.6-flash:', err.message);
  }
}

testGenerate();
