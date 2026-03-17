const GlobalSettings = require('../models/GlobalSettings');

/**
 * Middleware to intercept requests when the system is in Maintenance Mode.
 * Admins are exempted to allow troubleshooting and configuration.
 */
const maintenanceMode = async (req, res, next) => {
    try {
        // Find the global settings document
        const settings = await GlobalSettings.findOne({ singletonId: 'tnu_settings' });

        // If maintenance mode is active and user is NOT an admin, block access
        if (settings?.maintenanceMode) {
            // Check if the user is an admin (bypass)
            // We assume 'protect' and 'authorize' middlewares have already run or will run.
            // However, maintenance mode usually happens early in the stack.
            // If the request has an admin token, we let it pass.
            
            if (req.user && req.user.role === 'ADMIN') {
                return next();
            }

            // Return 503 Service Unavailable
            return res.status(503).json({
                success: false,
                message: 'System is currently under maintenance for essential upgrades. Please check back shortly.',
                retryAfter: 3600 // 1 hour suggestion
            });
        }

        next();
    } catch (err) {
        console.error('Maintenance Middleware Error:', err);
        next(); // Fail open to avoid blocking site on DB issues
    }
};

module.exports = maintenanceMode;
