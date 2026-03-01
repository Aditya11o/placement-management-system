const crypto = require('crypto');
const Admin = require('../models/Admin');

const apiKeyAuth = async (req, res, next) => {
    let rawKey;

    if (req.headers['x-api-key']) {
        rawKey = req.headers['x-api-key'];
    }

    // Try finding via query string if not in header
    if (!rawKey && req.query.api_key) {
        rawKey = req.query.api_key;
    }

    if (!rawKey) {
        return res.status(401).json({ success: false, message: 'Not authorized to access this route. Missing API Key.' });
    }

    try {
        // Hash the incoming raw key to match the database stored state
        const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

        // Look for any Admin that holds this specific keyHash in its `api_keys` subdocument array
        const admin = await Admin.findOne({ 'api_keys.keyHash': keyHash });

        if (!admin) {
            return res.status(401).json({ success: false, message: 'Invalid API Key' });
        }

        // We attach the admin to req.user similar to what the standard JWT `protect` middleware does
        // This makes `apiKeyAuth` a drop-in capable alternative for external machines
        req.user = admin;
        req.user.role = 'ADMIN';
        req.isApiKeySession = true; // Flag in case downstream handlers need to know

        next();
    } catch (err) {
        console.error('API Key validation failed:', err);
        return res.status(500).json({ success: false, message: 'Internal Server Error during Key Authentication' });
    }
};

module.exports = { apiKeyAuth };
