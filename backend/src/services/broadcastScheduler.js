const cron = require('node-cron');
const Announcement = require('../models/Announcement');
const { dispatchToRole } = require('./notifyDispatcher');
const { clearCache } = require('../middlewares/cacheMiddleware');

/**
 * Initializes the broadcast scheduler.
 * Runs every minute to check for announcements that need to be sent.
 */
const initBroadcastScheduler = () => {
    // Run every minute: * * * * *
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();

            // Find announcements that are SCHEDULED and their time has passed
            const pendingAnnouncements = await Announcement.find({
                status: 'SCHEDULED',
                scheduled_at: { $lte: now }
            });

            if (pendingAnnouncements.length === 0) return;

            console.log(`[Scheduler] Found ${pendingAnnouncements.length} announcements to broadcast.`);

            for (const ann of pendingAnnouncements) {
                // Update status to SENT
                ann.status = 'SENT';
                await ann.save();

                const payload = {
                    _id: ann._id,
                    title: ann.title,
                    message: ann.message,
                    created_at: ann.created_at
                };

                // Dispatch to targeted roles
                ann.target_roles.forEach(role => {
                    dispatchToRole(role, 'new_announcement', payload);
                });

                console.log(`[Scheduler] Broadcasted announcement: ${ann.title}`);
            }

            // Clear cache since we updated statuses
            await clearCache('/api/v1/announcements');

        } catch (err) {
            console.error('[Scheduler] Error in broadcast scheduler:', err.message);
        }
    });

    console.log('[Scheduler] Broadcast scheduler initialized (minutely).');
};

module.exports = { initBroadcastScheduler };
