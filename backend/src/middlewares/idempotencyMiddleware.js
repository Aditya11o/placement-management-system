const { getRedisClient } = require('../config/redis');
const logger = require('../utils/logger');

// How long to cache an idempotent response (24 hours is the Stripe standard)
const IDEMPOTENCY_TTL_SECONDS = 86400;

/**
 * Idempotency Middleware
 *
 * Protects critical write endpoints from double-execution caused by:
 *   - Browser retries on slow network responses
 *   - Accidental double-clicks ("Submit" button hit twice)
 *   - Client-side retry logic after a timeout
 *
 * Usage:
 *   1. Client sends a unique `X-Idempotency-Key` header (e.g. a UUID v4) with each request.
 *   2. First request: processed normally, response is cached in Redis under that key.
 *   3. Subsequent requests with the SAME key: middleware intercepts and returns the cached response
 *      instantly WITHOUT re-executing the controller — preventing duplicates.
 *
 * The key is scoped to the authenticated user's ID to prevent one user from
 * "blocking" another user's operations with a guessed key.
 *
 * Expiry: 24 hours (keys older than 24h are considered fresh new requests)
 */
module.exports = function idempotency(req, res, next) {
    const idempotencyKey = req.headers['x-idempotency-key'];

    // If no key is provided, pass through normally (backwards compatible)
    if (!idempotencyKey) {
        return next();
    }

    // Validate key format — must be a non-empty string, max 128 chars
    if (typeof idempotencyKey !== 'string' || idempotencyKey.length > 128) {
        return res.status(400).json({
            success: false,
            message: 'X-Idempotency-Key must be a string of max 128 characters'
        });
    }

    const redis = getRedisClient();

    // If Redis is unavailable (e.g. Redis down in production), fail open — let request through
    if (!redis || !redis.isOpen) {
        logger.warn('[Idempotency] Redis unavailable — bypassing idempotency check');
        return next();
    }

    // Scope the key per user to prevent cross-user collisions
    const userId = req.user ? req.user.id : 'anonymous';
    const redisKey = `idempotency:${userId}:${idempotencyKey}`;

    // Intercept the actual res.json() call to cache the response before sending it
    const originalJson = res.json.bind(res);

    res.json = async function (body) {
        // Only cache SUCCESSFUL responses (2xx)
        if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
                await redis.set(
                    redisKey,
                    JSON.stringify({ statusCode: res.statusCode, body }),
                    { EX: IDEMPOTENCY_TTL_SECONDS }
                );
            } catch (err) {
                logger.error(`[Idempotency] Failed to cache response: ${err.message}`);
                // Don't break the response — fail gracefully
            }
        }
        return originalJson(body);
    };

    // Check Redis for an existing response with this key
    redis.get(redisKey).then((cached) => {
        if (cached) {
            // ✅ Duplicate detected — replay the original response without hitting the controller
            try {
                const { statusCode, body } = JSON.parse(cached);
                logger.info(`[Idempotency] Replaying cached response for key: ${idempotencyKey} (user: ${userId})`);

                // Include a header so the client knows this was a replayed response
                res.setHeader('X-Idempotent-Replayed', 'true');
                return res.status(statusCode).json(body);
            } catch {
                // If cache is corrupt, allow request to proceed fresh
                return next();
            }
        }

        // 🆕 First time seeing this key — allow the request to proceed
        next();
    }).catch((err) => {
        logger.error(`[Idempotency] Redis GET failed: ${err.message}`);
        // Fail open — let request through if Redis errors
        next();
    });
};
