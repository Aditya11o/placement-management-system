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
const { createRequestLogger } = require('./utils/logger');

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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());
app.use(csrfProtection); // CSRF protection (Double Submit Cookie)

// Express 5 compatibility fix for older middlewares (req.query and req.params are getters by default)
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
    console.warn('Express 5 compatibility shim failed for this request:', e.message);
  }
  next();
});

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Trust proxy if behind one (important for rate limiting accuracy)
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 10000, // max 10000 requests per window (relaxed for SPA activity and development)
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Request logging (morgan) — after security, before routes
createRequestLogger().forEach(mw => app.use(mw));

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

// Socket.io authentication middleware
io.use((socket, next) => {
  // Try auth header first, then query, then cookie
  let token = socket.handshake.auth?.token || socket.handshake.query?.token;
  
  // Fallback: parse token from cookies in handshake headers
  if (!token && socket.handshake.headers.cookie) {
    const cookies = socket.handshake.headers.cookie.split(';').reduce((acc, c) => {
      const [key, val] = c.trim().split('=');
      if (key && val) acc[key] = decodeURIComponent(val);
      return acc;
    }, {});
    token = cookies.token;
  }
  
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
