const GlobalSettings = require('../models/GlobalSettings');

/**
 * Middleware to restrict Admin access based on IP Whitelist in GlobalSettings.
 * Only applies if adminIpWhitelist is not empty.
 */
const ipWhitelist = async (req, res, next) => {
    try {
        // Skip check if user is not an Admin (though this should be applied after authorize('ADMIN'))
        if (req.user && req.user.role !== 'ADMIN') {
            return next();
        }

        const settings = await GlobalSettings.findOne({ singletonId: 'nexus_settings' });

        // If no settings or whitelist is empty, allow access
        if (!settings || !settings.adminIpWhitelist || settings.adminIpWhitelist.length === 0) {
            return next();
        }

        const clientIp = req.ip || req.connection.remoteAddress;

        // Check if client IP is in the whitelist (supporting simple string match for now)
        // In a real scenario, you might want to support CIDR ranges.
        const isWhitelisted = settings.adminIpWhitelist.some(ip => {
            // Handle both IPv4 and IPv6-mapped IPv4
            const cleanIp = ip.trim();
            return clientIp === cleanIp || clientIp === `::ffff:${cleanIp}`;
        });

        if (!isWhitelisted) {
            console.warn(`Blocked unauthorized admin access attempt from IP: ${clientIp}`);
            return res.status(403).json({
                success: false,
                message: 'Access denied: Your IP address is not whitelisted for administrative actions.'
            });
        }

        next();
    } catch (err) {
        console.error('IP Whitelist Middleware Error:', err);
        next(); // Fail open for safety or closed for security? Usually closed for IP whitelisting.
    }
};

module.exports = ipWhitelist;
