const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const csrfProtection = require('./middleware/csrfMiddleware');
const logger = require('./utils/logger');
const { createRequestLogger } = require('./utils/logger');

const app = express();

if (process.env.NODE_ENV === 'test') {
  const mockIo = {
    emit: () => {},
    to: () => mockIo,
  };
  app.set('io', mockIo);
}

// CORS must be handled before other middlewares to correctly manage OPTIONS preflight requests
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Middleware
app.use(helmet()); // Security headers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// In test environment, we might want to disable CSRF or use a simpler mock
if (process.env.NODE_ENV !== 'test') {
  app.use(csrfProtection); // CSRF protection (Double Submit Cookie)
}

// Express 5 compatibility fix for older middlewares
app.use((req, res, next) => {
  try {
    if (req.query && Object.getOwnPropertyDescriptor(req, 'query')?.configurable !== false) {
      const rawQuery = { ...req.query };
      Object.defineProperty(req, 'query', {
        value: rawQuery,
        writable: true,
        configurable: true,
        enumerable: true
      });
    }
    if (req.params && Object.getOwnPropertyDescriptor(req, 'params')?.configurable !== false) {
      const rawParams = { ...req.params };
      Object.defineProperty(req, 'params', {
        value: rawParams,
        writable: true,
        configurable: true,
        enumerable: true
      });
    }
  } catch (e) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn('Express 5 compatibility shim failed for this request:', e.message);
    }
  }
  next();
});

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Trust proxy if behind one
app.set('trust proxy', 1);

// Rate limiting (Relaxed for tests)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 100000 : 10000,
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Request logging
if (process.env.NODE_ENV !== 'test') {
  createRequestLogger().forEach(mw => app.use(mw));
}

// Specific rate limit for login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 100 : 5,
  message: 'Too many login attempts, please try again after 15 minutes',
});
app.use('/api/auth/login', loginLimiter);

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/audit', require('./routes/auditLogRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/alumni', require('./routes/alumniRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));
app.use('/api/faqs', require('./routes/faqRoutes'));
app.use('/api/mock-interviews', require('./routes/mockInterviewRoutes'));
app.use('/api/reminders', require('./routes/reminderRoutes'));
app.use('/api/interviews', require('./routes/interviewRoutes'));

// Basic Route
app.get('/', (req, res) => {
  res.send('Placement Management System API is running...');
});

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  if (process.env.NODE_ENV !== 'test') {
    logger.error(err, req);
    console.error('SERVER ERROR:', err);
  }

  res.status(statusCode).json({
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred. Please try again later.' 
      : err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

module.exports = app;
