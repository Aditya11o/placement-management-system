const Log = require('../models/Log');
const logger = require('../utils/logger');

/**
 * Middleware to log access to Student PII (Personal Identifiable Information)
 * This is triggered for Admin routes that return student data.
 */
exports.logPIIAccess = (req, res, next) => {
    // We only care about ADMINs viewing data
    if (!req.user || req.user.role !== 'ADMIN') return next();

    // Store the original res.json function to intercept the response
    const originalJson = res.json;

    res.json = function (data) {
        // If the request succeeded and returned data
        if (data && data.success && data.data) {
            let target_ids = [];

            // Case 1: Single object (e.g., student profile)
            if (!Array.isArray(data.data)) {
                if (data.data.email || data.data.phone) {
                    target_ids.push(data.data._id);
                }
            } 
            // Case 2: Array of objects (e.g., student list)
            else {
                data.data.forEach(item => {
                    if (item.email || item.phone) {
                        target_ids.push(item._id);
                    }
                });
            }

            // Log if PII was actually present in the final data
            if (target_ids.length > 0) {
                // Background log creation to not block the response
                Log.create({
                    user_id: req.user._id,
                    user_role: 'ADMIN',
                    action: 'VIEW_PII',
                    description: `Admin viewed sensitive data for ${target_ids.length} student(s)`,
                    metadata: {
                        resource: req.originalUrl,
                        accessed_ids: target_ids.slice(0, 50), // Limit log size
                        partial: target_ids.length > 50
                    },
                    ip_address: req.ip
                }).catch(err => logger.error(`PII Audit Failure: ${err.message}`));
            }
        }

        return originalJson.call(this, data);
    };

    next();
};
