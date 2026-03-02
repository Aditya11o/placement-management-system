const rateLimit = require('express-rate-limit');

// In test environment bypass all rate limiting so integration tests
// don't get blocked by the IP-based counter.
const passThru = (_req, _res, next) => next();

// Rate limiting for login routes (10 requests per 15 minutes)
exports.loginLimiter = process.env.NODE_ENV === 'test'
    ? passThru
    : rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 10,
        message: {
            success: false,
            message: 'Too many login attempts from this IP, please try again after 15 minutes.'
        }
    });

// Rate limiting for registration routes (5 requests per 15 minutes)
exports.registerLimiter = process.env.NODE_ENV === 'test'
    ? passThru
    : rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5,
        message: {
            success: false,
            message: 'Too many accounts created from this IP, please try again after 15 minutes.'
        }
    });
