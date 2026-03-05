const { getRedisClient } = require('../config/redis');
const logger = require('../utils/logger');

/**
 * Middleware to cache HTTP responses using Redis
 * @param {number} duration - Cache duration in seconds
 */
const cache = (duration = 300) => {
    return async (req, res, next) => {
        // Skip caching if we are running tests to prevent Redis handle leaks
        if (process.env.NODE_ENV === 'test') {
            return next();
        }

        const redisClient = getRedisClient();

        if (!redisClient || !redisClient.isReady) {
            // Redis is not connected, gracefully bypass caching
            return next();
        }

        const key = `cache:${req.originalUrl || req.url}`;

        try {
            const cachedResponse = await redisClient.get(key);

            if (cachedResponse) {
                logger.debug(`Cache hit for key: ${key}`);
                return res.status(200).json(JSON.parse(cachedResponse));
            }

            logger.debug(`Cache miss for key: ${key}`);

            // Intercept res.json to capture the response body before sending
            const originalJson = res.json;
            res.json = function (body) {
                // Only cache successful GET responses
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        redisClient.setEx(key, duration, JSON.stringify(body));
                    } catch (err) {
                        logger.error(`Error writing to cache for key ${key}: ${err.message}`);
                    }
                }

                // Call the original res.json function to send the response
                originalJson.call(this, body);
            };

            next();
        } catch (err) {
            logger.error(`Redis cache error: ${err.message}`);
            // Proceed to next middleware on cache failures to ensure high availability
            next();
        }
    };
};

/**
 * Utility function to clear cache by a pattern
 * @param {string} pattern - Pattern to match (e.g. '/api/v1/jobs*')
 */
const clearCache = async (pattern) => {
    if (process.env.NODE_ENV === 'test') return;

    const redisClient = getRedisClient();
    if (!redisClient || !redisClient.isReady) return;

    try {
        const searchPattern = `cache:${pattern}*`;
        const keys = await redisClient.keys(searchPattern);

        if (keys && keys.length > 0) {
            // Delete keys one by one for maximum compatibility across Redis client versions
            for (const key of keys) {
                await redisClient.del(key);
            }
            logger.info(`Cleared ${keys.length} cache entries for pattern: ${pattern}`);
        }
    } catch (err) {
        logger.error(`Error clearing cache for pattern ${pattern}: ${err.message}`);
    }
};

module.exports = {
    cache,
    clearCache
};
