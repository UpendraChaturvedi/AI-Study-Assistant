import axios from 'axios';

const BACKEND_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Axios client for Chrome Extension to Backend API communication
 */
export const apiClient = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

/**
 * Register User Account
 */
export const registerAPI = async (name, email, password) => {
  try {
    const response = await apiClient.post('/user/register', { name, email, password });
    return response.data;
  } catch (error) {
    console.error('[API Error - register]:', error);
    throw error?.response?.data || { error: 'Failed to register account.' };
  }
};

/**
 * Sign In User Account
 */
export const loginAPI = async (email, password) => {
  try {
    const response = await apiClient.post('/user/login', { email, password });
    return response.data;
  } catch (error) {
    console.error('[API Error - login]:', error);
    throw error?.response?.data || { error: 'Invalid email or password.' };
  }
};

/**
 * Submit / Generate AI Study Material Session
 */
export const generateStudyMaterialAPI = async (payload) => {
  try {
    const response = await apiClient.post('/generate/study-material', payload);
    return response.data;
  } catch (error) {
    console.error('[API Error - generateStudyMaterial]:', error);
    throw error?.response?.data || { error: 'Failed to connect to AI Study Assistant backend server.' };
  }
};

/**
 * Submit Quiz Answers & Get Score Evaluation
 */
export const submitQuizAnswersAPI = async (quizId, userAnswers = [], userId = 'anonymous_user') => {
  try {
    const response = await apiClient.post('/user/quiz-submit', { quizId, userAnswers, userId });
    return response.data;
  } catch (error) {
    console.error('[API Error - submitQuizAnswers]:', error);
    throw error?.response?.data || { error: 'Failed to submit quiz answers.' };
  }
};

/**
 * Fetch User Study Analytics Summary
 */
export const fetchUserAnalyticsAPI = async (userId = 'anonymous_user') => {
  try {
    const response = await apiClient.get(`/user/analytics?userId=${userId}`);
    return response.data;
  } catch (error) {
    console.error('[API Error - fetchUserAnalytics]:', error);
    throw error?.response?.data || { error: 'Failed to fetch user analytics.' };
  }
};

/**
 * Fetch Saved MongoDB Sessions History
 */
export const fetchSavedSessionsAPI = async (videoId) => {
  try {
    const url = videoId ? `/generate/sessions?videoId=${videoId}` : '/generate/sessions';
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error('[API Error - fetchSavedSessions]:', error);
    throw error?.response?.data || { error: 'Failed to fetch saved sessions.' };
  }
};

/**
 * Fetch single session details by ID
 */
export const fetchSessionByIdAPI = async (sessionId) => {
  try {
    const response = await apiClient.get(`/generate/session/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('[API Error - fetchSessionById]:', error);
    throw error?.response?.data || { error: 'Failed to fetch session details.' };
  }
};
