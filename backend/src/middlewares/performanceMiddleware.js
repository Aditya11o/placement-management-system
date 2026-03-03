const logger = require('../utils/logger');

/**
 * Performance Observability Middleware (Slow-Motion Profiler)
 * 
 * Intercepts requests and logs detailed context if the response takes longer 
 * than the specified threshold. Essential for identifying database bottlenecks 
 * or slow third-party API calls under heavy load.
 * 
 * @param {number} thresholdMs - Threshold in milliseconds to flag as "slow"
 */
const performanceObserver = (thresholdMs = 500) => {
    return (req, res, next) => {
        // High-resolution time representation for accurate profiling
        const startHrTime = process.hrtime.bigint();

        res.on('finish', () => {
            const endHrTime = process.hrtime.bigint();
            const elapsedMs = Number(endHrTime - startHrTime) / 1_000_000;

            if (elapsedMs > thresholdMs) {
                // Determine user context safely
                const userContext = req.user ? `[User: ${req.user.id} | Role: ${req.user.role}]` : '[Unauthenticated]';

                // Extract clean query parameters and body keys for diagnostic context
                const queryParams = Object.keys(req.query).length ? ` | Query: ${JSON.stringify(req.query)}` : '';
                const bodyKeys = Object.keys(req.body || {}).join(',');
                const bodyContext = bodyKeys ? ` | BodyKeys: [${bodyKeys}]` : '';

                logger.warn(
                    `🐌 [PERF DEGRADATION] HTTP ${req.method} ${req.originalUrl} ` +
                    `took ${elapsedMs.toFixed(2)}ms (Threshold: ${thresholdMs}ms). ` +
                    `Status: ${res.statusCode} ${userContext}${queryParams}${bodyContext}`
                );
            }
        });

        next();
    };
};

module.exports = performanceObserver;
