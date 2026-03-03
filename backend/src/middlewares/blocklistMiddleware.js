const { getRedisClient } = require('../config/redis');
const logger = require('../utils/logger');
const config = require('../config/config');

/**
 * Global Middleware to intercept incoming IPs and deny access if they exist in the Redis Blocklist
 */
const checkBlocklist = async (req, res, next) => {
    if (config.get('env') === 'test') { return next(); }

    const redisClient = getRedisClient();
    if (!redisClient || !redisClient.isOpen) {
        return next(); // Fail gracefully if Redis is offline
    }

    // Get the true client IP (accounting for proxies/load balancers)
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;

    // Whitelist local IP addresses to prevent lockouts during development
    if (clientIp === '::1' || clientIp === '127.0.0.1' || clientIp === '::ffff:127.0.0.1') {
        return next();
    }

    const blockKey = `blocklist:${clientIp}`;

    try {
        const isBlocked = await redisClient.get(blockKey);

        if (isBlocked) {
            logger.warn(`BLOCKED IP ATTEMPT: ${clientIp} attempted to access ${req.originalUrl}`);
            return res.status(403).json({
                success: false,
                message: 'Your IP Address has been temporarily banned for suspicious activity. If you believe this is an error, please contact the administrator.'
            });
        }

        next();
    } catch (err) {
        logger.error(`Redis Blocklist Error: ${err.message}`);
        next();
    }
};

/**
 * Utility function to ban an IP address dynamically
 * @param {string} ip - The IP to ban
 * @param {number} durationHours - How many hours to ban the IP
 * @param {string} reason - The reason for logging
 */
const banIp = async (ip, durationHours = 24, reason = 'Not specified') => {
    if (config.get('env') === 'test') { return; }

    const redisClient = getRedisClient();
    if (!redisClient || !redisClient.isOpen) return;

    // Never ban local development addresses
    if (ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1') {
        logger.info(`🛡️  SECURITY: Prevented banning local IP ${ip}. Reason: ${reason}`);
        return;
    }

    const blockKey = `blocklist:${ip}`;
    const seconds = durationHours * 3600;

    try {
        await redisClient.setEx(blockKey, seconds, 'BANNED');
        logger.warn(`🛡️  SECURITY: Banned IP ${ip} for ${durationHours} hours. Reason: ${reason}`);
    } catch (err) {
        logger.error(`Failed to ban IP ${ip}: ${err.message}`);
    }
};

module.exports = { checkBlocklist, banIp };
