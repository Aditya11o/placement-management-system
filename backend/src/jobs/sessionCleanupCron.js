const cron = require('node-cron');
const Session = require('../models/Session');

// Run daily at 2:00 AM
const initSessionCleanupCron = () => {
    cron.schedule('0 2 * * *', async () => {
        try {
            console.log('[CRON] Running Expired Session Cleanup...');
            const now = new Date();

            const result = await Session.deleteMany({
                expires_at: { $lt: now }
            });

            console.log(`[CRON] Cleaned up ${result.deletedCount} expired sessions.`);
        } catch (error) {
            console.error('[CRON ERROR] sessionCleanupCron failed:', error);
        }
    });
};

module.exports = initSessionCleanupCron;
