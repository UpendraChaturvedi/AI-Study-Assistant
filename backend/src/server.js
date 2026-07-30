import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';

// Load environment variables from .env file
dotenv.config();

const PORT = process.env.PORT || 5000;

// Start database and server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`===================================================`);
      console.log(`🚀 AI Study Assistant Server running on port ${PORT}`);
      console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
      console.log(`===================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
