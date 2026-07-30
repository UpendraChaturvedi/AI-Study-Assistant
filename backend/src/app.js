import express from 'express';
import cors from 'cors';
import generateRoutes from './routes/generate.routes.js';
import userRoutes from './routes/user.routes.js';

const app = express();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'AI Study Assistant Backend API',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/generate', generateRoutes);
app.use('/api/user', userRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'API Endpoint not found' });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('[Unhandled Internal Error]:', err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

export default app;
