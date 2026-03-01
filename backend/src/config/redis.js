const redis = require('redis');
const logger = require('../utils/logger');

let redisClient;

const connectRedis = async () => {
    try {
        redisClient = redis.createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379',
            socket: {
                reconnectStrategy: (retries) => {
                    // Stop trying to reconnect after 5 attempts
                    if (retries > 5) {
                        logger.warn('Redis max retries reached. Disabling caching gracefully.');
                        return new Error('Max retries reached');
                    }
                    return Math.min(retries * 50, 500);
                }
            }
        });

        redisClient.on('error', (err) => {
            logger.error(`Redis connection error: ${err.message}`);
        });

        await redisClient.connect();
        logger.info('Redis connected successfully (Caching Enabled)');
    } catch (err) {
        logger.error(`Could not connect to Redis: ${err.message}. System will continue without caching.`);
    }
};

const getRedisClient = () => redisClient;

module.exports = { connectRedis, getRedisClient };
