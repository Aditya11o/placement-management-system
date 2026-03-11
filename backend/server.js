const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./src/config/db');
const morganMiddleware = require('./src/middlewares/morganMiddleware');
const logger = require('./src/utils/logger');
const config = require('./src/config/config');

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

// Connect to Database
if (config.get('env') !== 'test') {
    connectDB();
}

// Connect to Redis (Graceful)
const { connectRedis } = require('./src/config/redis');
connectRedis();

const app = express();
app.set('trust proxy', 1); // Enable trusting proxy for rate limiting (e.g., behind Nginx/Render/Heroku)
let server;

// Mount HTTP or HTTPS Server based on Environment
if (config.get('https')) {
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

const performanceObserver = require('./src/middlewares/performanceMiddleware');
// Log requests taking longer than 500ms for semantic observability
app.use(performanceObserver(500));

// Health Check (Exempt from Rate Limiting for monitoring, but needs CORS)
const healthRoutes = require('./src/routes/healthRoutes');
const healthCorsWhitelist = config.get('cors.whitelist');
const healthCors = cors({
    origin: function (origin, callback) {
        if (!origin || healthCorsWhitelist.indexOf(origin) !== -1 || config.get('env') === 'test') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
});
app.use('/api/v1/health', healthCors, healthRoutes);

// Global Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    skip: (req, res) => {
        const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;
        return clientIp === '::1' || clientIp === '127.0.0.1' || clientIp === '::ffff:127.0.0.1';
    },
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
const whitelist = config.get('cors.whitelist');
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || whitelist.indexOf(origin) !== -1 || config.get('env') === 'test') { // allow requests with no origin (like mobile apps or curl requests) and testing
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
app.use(xss());
app.use(hpp());

// Routes
const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const studentRoutes = require('./src/routes/studentRoutes');
const jobRoutes = require('./src/routes/jobRoutes');
const applicationRoutes = require('./src/routes/applicationRoutes');
const announcementRoutes = require('./src/routes/announcementRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const interviewRoutes = require('./src/routes/interviewRoutes');
const notificationPrefsRoutes = require('./src/routes/notificationPrefsRoutes');
const rbacRoutes = require('./src/routes/rbacRoutes');
const logRoutes = require('./src/routes/logRoutes');
const searchRoutes = require('./src/routes/searchRoutes');
const aiRoutes = require('./src/routes/aiRoutes');
const teamRoutes = require('./src/routes/teamRoutes');
const initCronJobs = require('./src/jobs/index');
const { initBroadcastScheduler } = require('./src/services/broadcastScheduler');
const { initDigestCron } = require('./src/services/digestService');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/students', studentRoutes);
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
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/team', teamRoutes);

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

const PORT = config.get('port');

// Only start the server if not running tests
if (config.get('env') !== 'test') {
    const listener = server.listen(PORT, () => {
        logger.info(`Server running in ${config.get('env')} mode on port ${PORT}`);
        // Initialize background scheduled workers
        initCronJobs();
        initBroadcastScheduler();
        initDigestCron();
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
        server.close(() => process.exit(1));
    });

    // ==========================================
    // Graceful Shutdown Implementation
    // ==========================================

    const { emailWorker } = require('./src/utils/emailQueue');
    const { bulkWorker } = require('./src/utils/bulkQueue');
    const { dataExportWorker } = require('./src/utils/dataExportQueue');
    const { webhookWorker } = require('./src/utils/webhookQueue');

    const gracefulShutdown = async (signal) => {
        logger.info(`[SHUTDOWN] Signal received: ${signal}. Starting graceful shutdown...`);

        // 1. Force exit after 10 seconds to prevent hanging
        const forceExitTimeout = setTimeout(() => {
            logger.error('[SHUTDOWN] Forcefully exiting after timeout.');
            process.exit(1);
        }, 10000);

        try {
            // 2. Stop accepting new HTTP requests
            if (server) {
                server.close(() => {
                    logger.info('[SHUTDOWN] HTTP server closed.');
                });
            }

            // 3. Close BullMQ Workers (Pause processing and wait for current jobs)
            const workers = [emailWorker, bulkWorker, dataExportWorker, webhookWorker];
            for (const worker of workers) {
                if (worker) {
                    await worker.close();
                    logger.info(`[SHUTDOWN] Worker for ${worker.name} closed.`);
                }
            }

            // 4. Close Redis handles (if applicable)
            const { getRedisClient } = require('./src/config/redis');
            const redisClient = getRedisClient();
            if (redisClient) {
                await redisClient.quit();
                logger.info('[SHUTDOWN] Redis connection closed.');
            }

            // 5. Close MongoDB Connection
            if (mongoose.connection.readyState !== 0) {
                await mongoose.connection.close();
                logger.info('[SHUTDOWN] MongoDB connection closed.');
            }

            clearTimeout(forceExitTimeout);
            logger.info('[SHUTDOWN] All resources released. Goodbye!');
            process.exit(0);

        } catch (err) {
            logger.error(`[SHUTDOWN] Error during shutdown: ${err.message}`);
            process.exit(1);
        }
    };

    // Register listeners
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

module.exports = { app, server };
