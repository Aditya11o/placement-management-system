const cron = require('node-cron');
const Notification = require('../models/Notification');
const NotificationPrefs = require('../models/NotificationPrefs');
const { emailQueue } = require('../utils/emailQueue');
const logger = require('../utils/logger');
const moment = require('moment');

/**
 * Daily Digest Service
 * Runs every day at 6:00 PM
 */
const initDigestCron = () => {
    // 0 18 * * * = 6:00 PM daily
    cron.schedule('0 18 * * *', async () => {
        logger.info('[digestService] Starting Daily Email Digest run...');
        await sendDailyDigests();
    });
};

/**
 * Aggregates unread notifications for all users who opted for DAILY frequency
 * and sends a summary email.
 */
const sendDailyDigests = async () => {
    try {
        // 1. Find all users who want DAILY digests
        const usersWithDigest = await NotificationPrefs.find({ emailFrequency: 'DAILY' });

        const last24h = moment().subtract(24, 'hours').toDate();

        for (const pref of usersWithDigest) {
            // 2. Find unread notifications in last 24h for this user
            const unreadNotifs = await Notification.find({
                recipientId: pref.userId,
                isRead: false,
                createdAt: { $gte: last24h }
            }).sort({ createdAt: -1 });

            if (unreadNotifs.length === 0) continue;

            // 3. Prepare summary data
            // Group by type or just list them
            const summaryItems = unreadNotifs.map(n => ({
                title: n.title,
                message: n.message,
                time: moment(n.createdAt).format('hh:mm A')
            }));

            // 4. Fetch user details to get email
            const mongoose = require('mongoose');
            const user = await mongoose.model(pref.userModel).findById(pref.userId).select('email name');

            if (!user || !user.email) continue;

            // 5. Queue summary email
            await emailQueue.add('daily-digest-email', {
                email: user.email,
                subject: `Your Daily Wrap-up: ${unreadNotifs.length} new updates`,
                template: 'digest',
                context: {
                    name: user.name,
                    count: unreadNotifs.length,
                    notifications: summaryItems,
                    cta: {
                        text: 'View All Notifications',
                        url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/notifications`
                    }
                }
            });

            logger.info(`[digestService] Queued digest for ${user.email} (${unreadNotifs.length} items)`);
        }

        logger.info('[digestService] Daily Email Digest run completed.');
    } catch (err) {
        logger.error(`[digestService] Run failed: ${err.message}`);
    }
};

// Export for manual triggering in tests
module.exports = { initDigestCron, sendDailyDigests };
