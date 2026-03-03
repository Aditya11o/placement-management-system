const Notification = require('../models/Notification');
const NotificationPrefs = require('../models/NotificationPrefs');
const { notifyUser, notifyRole, notifyAll } = require('../utils/socketManager');
const logger = require('../utils/logger');

/**
 * Dispatches a targeted notification to a SINGLE user.
 * Checks NotificationPrefs BEFORE:
 *   1. Persisting a Notification document to MongoDB
 *   2. Pushing a live WebSocket event
 *
 * @param {Object} options
 * @param {string|ObjectId} options.recipientId   - The MongoDB _id of the recipient
 * @param {string} options.recipientModel         - 'Student' | 'Recruiter' | 'Admin'
 * @param {string} options.eventName              - Preference key (e.g. 'application_status_update')
 * @param {string} options.title                  - Short notification title
 * @param {string} options.message                - Full notification body
 * @param {string} [options.type]                 - 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'
 * @param {string} [options.link]                 - Frontend deep-link URL
 */
const dispatchToUser = async ({ recipientId, recipientModel, eventName, title, message, type = 'INFO', link }) => {
    try {
        // Fetch prefs (or use defaults) — fail open if anything goes wrong
        let prefs = null;
        try {
            prefs = await NotificationPrefs.findOne({ userId: recipientId });
        } catch {
            // If prefs lookup fails, default to sending everything
        }

        const shouldPersist = !prefs || prefs.allowsEmail(eventName) || prefs.allowsPush(eventName);
        const shouldPush = !prefs || prefs.allowsPush(eventName);

        // If both channels are off, skip entirely
        if (!shouldPersist && !shouldPush) {
            logger.info(`[notifyDispatcher] Skipped '${eventName}' for ${recipientId} — opted out`);
            return null;
        }

        let notification = null;

        // Step 1: Persist to DB if email/push channel is enabled
        if (shouldPersist) {
            notification = await Notification.create({
                recipientId,
                recipientModel,
                title,
                message,
                type,
                link
            });
        }

        // Step 2: Push live WebSocket event if push is enabled
        if (shouldPush) {
            notifyUser(recipientId, 'new_notification', {
                _id: notification?._id,
                title,
                message,
                type,
                link,
                createdAt: notification?.createdAt || new Date()
            });
        }

        return notification;
    } catch (err) {
        logger.error(`[notifyDispatcher] dispatchToUser failed: ${err.message}`);
    }
};




/**
 * Dispatches a broadcast notification to ALL users of a specific role.
 * Does NOT persist individual notifications per user (role broadcasts are ephemeral, 
 * they fire and the frontend renders a transient toast — no inbox entry needed).
 *
 * @param {string} role          - 'STUDENT' | 'RECRUITER' | 'ADMIN'
 * @param {string} eventName     - Socket.io event name (e.g. 'new_job_posted')
 * @param {Object} payload       - Arbitrary payload for the frontend toast
 */
const dispatchToRole = (role, eventName, payload) => {
    try {
        notifyRole(role, eventName, payload);
    } catch (err) {
        logger.error(`[notifyDispatcher] dispatchToRole failed: ${err.message}`);
    }
};

/**
 * Dispatches a system-wide broadcast to ALL connected sockets.
 * Used for global announcements from Admins.
 *
 * @param {string} eventName  - Socket.io event name (e.g. 'system_announcement')
 * @param {Object} payload    - Payload pushed to every active connection
 */
const dispatchToAll = (eventName, payload) => {
    try {
        notifyAll(eventName, payload);
    } catch (err) {
        logger.error(`[notifyDispatcher] dispatchToAll failed: ${err.message}`);
    }
};

module.exports = { dispatchToUser, dispatchToRole, dispatchToAll };
