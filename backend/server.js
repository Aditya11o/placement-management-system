const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const morganMiddleware = require('./src/middlewares/morganMiddleware');
const logger = require('./src/utils/logger');

const helmet = require('helmet');

const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');

const { initializeSocket } = require('./src/utils/socketManager');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Load env variables
dotenv.config();

// Connect to Database
if (process.env.NODE_ENV !== 'test') {
    connectDB();
}

// Connect to Redis (Graceful)
const { connectRedis } = require('./src/config/redis');
connectRedis();

const app = express();
let server;

// Mount HTTP or HTTPS Server based on Environment
if (process.env.HTTPS === 'true') {
    const sslOptions = {
        key: fs.readFileSync(path.join(__dirname, 'ssl', 'key.pem')),
        cert: fs.readFileSync(path.join(__dirname, 'ssl', 'cert.pem'))
    };
    server = https.createServer(sslOptions, app);
    logger.info('🔒 Secure Server initialization: HTTPS Configuration loaded.');
} else {
    server = http.createServer(app);
    logger.info('⚠️ Standard Server initialization: HTTP (Cleartext) loaded.');
}

// Initialize Socket.io
initializeSocket(server);

// Middleware
app.use(helmet());  // Set security headers
const { checkBlocklist, banIp } = require('./src/middlewares/blocklistMiddleware');
app.use(checkBlocklist); // Instantly drop banned IPs connection
app.use(morganMiddleware);

// Health Check (Exempt from Rate Limiting for monitoring)
const healthRoutes = require('./src/routes/healthRoutes');
app.use('/api/v1/health', healthRoutes);

// Global Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes.' },
    handler: async (req, res, next, options) => {
        const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;
        logger.warn(`RATE LIMIT BREACHED BY ${clientIp}. Triggering 24-hour network ban.`);

        // Push to Redis blocklist for 24 hours
        await banIp(clientIp, 24, 'Exceeded Global Rate Limiting Thresholds (Spam/DDoS)');

        // Return 403 Forbidden payload
        res.status(403).json(options.message);
    }
});
app.use('/api', limiter);

// Setup CORS whitelist
const whitelist = process.env.CORS_WHITELIST ? process.env.CORS_WHITELIST.split(',') : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'];
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || whitelist.indexOf(origin) !== -1 || process.env.NODE_ENV === 'test') { // allow requests with no origin (like mobile apps or curl requests) and testing
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
};
app.use(cors(corsOptions));

const cookieParser = require('cookie-parser');

app.use(express.json());
app.use(cookieParser());

// Sanitize data against NoSQL query injection
app.use(mongoSanitize());

// Prevent XSS attacks
app.use(xss());

// Prevent HTTP param pollution
app.use(hpp());

// Routes
const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const jobRoutes = require('./src/routes/jobRoutes');
const applicationRoutes = require('./src/routes/applicationRoutes');
const announcementRoutes = require('./src/routes/announcementRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const interviewRoutes = require('./src/routes/interviewRoutes');
const healthRoutes = require('./src/routes/healthRoutes');
const notificationPrefsRoutes = require('./src/routes/notificationPrefsRoutes');
const rbacRoutes = require('./src/routes/rbacRoutes');
const logRoutes = require('./src/routes/logRoutes');
const initCronJobs = require('./src/jobs/index');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/announcements', announcementRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/interviews', interviewRoutes);
// app.use('/api/v1/health', healthRoutes); // Moved up to exempt from rate limiting
app.use('/api/v1/notification-prefs', notificationPrefsRoutes);
app.use('/api/v1/rbac', rbacRoutes);
app.use('/api/v1/logs', logRoutes);

// Basic Route
app.get('/', (req, res) => {
    res.send('Placement Management System API is running...');
});

// Setup Swagger API Documentation
const swaggerDocs = require('./src/config/swagger');
swaggerDocs(app);

// Error Handler Middleware
const errorHandler = require('./src/middlewares/errorMiddleware');
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Only start the server if not running tests
if (process.env.NODE_ENV !== 'test') {
    const listener = server.listen(PORT, () => {
        logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        // Initialize background scheduled workers
        initCronJobs();
    });

    // Handle EADDRINUSE (Port already in use) gracefully
    listener.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            logger.error(`Port ${PORT} is already in use. Attempting to kill the process...`);
            const { exec } = require('child_process');
            exec(`npx kill-port ${PORT}`, (error, stdout, stderr) => {
                if (error) {
                    logger.error(`Failed to kill process on port ${PORT}: ${error.message}`);
                    process.exit(1);
                }
                logger.info(`Successfully killed process on port ${PORT}. Restarting server...`);
                // Wait briefly before attempting to listen again to ensure port is freed
                setTimeout(() => {
                    listener.listen(PORT);
                }, 1000);
            });
        } else {
            logger.error(`Server error: ${err.message}`);
        }
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err, promise) => {
        logger.error(`Error: ${err.message}`);
        listener.close(() => process.exit(1));
    });
}

module.exports = { app, server };
