/**
 * src/index.js – Express application entry point
 *
 * Bootstraps middleware, mounts API routes, attaches the global error handler,
 * connects to MongoDB, and starts the HTTP server.
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const errorHandler = require('./middleware/errorHandler');

// ── App setup ─────────────────────────────────────────────────────────────────

const app = express();

// ── Global middleware ─────────────────────────────────────────────────────────

// Allow the React dev server to call this API and send credentials (cookies)
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);

// Parse incoming JSON request bodies
app.use(express.json());

// Parse cookies (used for the httpOnly JWT cookie)
app.use(cookieParser());

// HTTP request logger – only enable in development to avoid log noise in CI
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ── Routes ────────────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Basic health-check endpoint (no auth required)
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Task Tracker API is running' });
});

// ── Global error handler ──────────────────────────────────────────────────────
// Must be registered AFTER all routes (4-argument signature signals error middleware to Express)
app.use(errorHandler);

// ── Database + server start ───────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
};

start();
