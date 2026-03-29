const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { initCron } = require('./utils/cron');

const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const csrfProtection = require('./middleware/csrfMiddleware');
const logger = require('./utils/logger');

// Load environment variables
dotenv.config();

// Fail-fast: ensure critical secrets are configured
if (!process.env.JWT_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
  console.error('FATAL: JWT_SECRET and REFRESH_TOKEN_SECRET must be set in .env');
  process.exit(1);
}

// Connect to database
connectDB();

// Initialize Cron Jobs
initCron();

const app = express();
const server = http.createServer(app);

// CORS must be handled before other middlewares to correctly manage OPTIONS preflight requests
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true
  },
});

// Make io accessible to our routers/controllers
app.set('io', io);

// Middleware
app.use(helmet()); // Security headers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(csrfProtection); // CSRF protection (Double Submit Cookie)

// Express 5 compatibility fix for older middlewares (req.query and req.params are getters by default)
app.use((req, res, next) => {
  if (req.query) {
    const rawQuery = req.query;
    Object.defineProperty(req, 'query', {
      value: { ...rawQuery },
      writable: true,
      configurable: true,
      enumerable: true
    });
  }
  if (req.params) {
    const rawParams = req.params;
    Object.defineProperty(req, 'params', {
      value: { ...rawParams },
      writable: true,
      configurable: true,
      enumerable: true
    });
  }
  next();
});

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 5000, // max 5000 requests per window (relaxed for SPA activity)
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api/', limiter);

// Specific rate limit for login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts per 15 mins
  message: 'Too many login attempts, please try again after 15 minutes',
});
app.use('/api/auth/login', loginLimiter);

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const auditLogRoutes = require('./routes/auditLogRoutes');

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/audit', auditLogRoutes);
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/student', require('./routes/studentRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));
app.use('/api/faqs', require('./routes/faqRoutes'));
app.use('/api/mock-interviews', require('./routes/mockInterviewRoutes'));
app.use('/api/reminders', require('./routes/reminderRoutes'));
app.use('/api/interviews', require('./routes/interviewRoutes'));

// Socket.io authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (!token) {
    return next(new Error('Authentication required'));
  }
  try {
    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    return next(new Error('Invalid token'));
  }
});

// Socket.io connection (authenticated)
io.on('connection', (socket) => {
  console.log('Authenticated user connected:', socket.userId, socket.id);

  // Auto-join the user to their own private room (no client-controlled room joining)
  socket.join(socket.userId.toString());

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Basic Route
app.get('/', (req, res) => {
  res.send('Placement Management System API is running...');
});

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Log error to file
  logger.error(err, req);
  console.error('SERVER ERROR:', err);

  res.status(statusCode).json({
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred. Please try again later.' 
      : err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
