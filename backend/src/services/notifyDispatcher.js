const Notification = require('../models/Notification');
const NotificationPrefs = require('../models/NotificationPrefs');
const { notifyUser, notifyRole, notifyAll } = require('../utils/socketManager');
const { emailQueue } = require('../utils/emailQueue');
const { sendWebhook } = require('../utils/webhookHelper');
const { sendSMS } = require('../services/smsService');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

/**
 * Dispatches a targeted notification to a SINGLE user across all enabled channels.
 */
const dispatchToUser = async ({
    recipientId,
    recipientModel,
    eventName,
    title,
    message,
    type = 'INFO',
    link,
    metadata = {},
    emailOptions = null // Optional override for email subject/template
}) => {
    try {
        // 1. Fetch User and Prefs concurrently
        const [recipient, prefs] = await Promise.all([
            mongoose.model(recipientModel).findById(recipientId),
            NotificationPrefs.findOne({ userId: recipientId })
        ]);

        if (!recipient) {
            logger.warn(`[notifyDispatcher] Recipient not found: ${recipientModel} ${recipientId}`);
            return null;
        }

        const isSilenced = prefs ? isInQuietHours(prefs) : false;
        const shouldPersist = !prefs || prefs.allowsEmail(eventName) || prefs.allowsPush(eventName);
        const isCritical = metadata.isCritical || type === 'ERROR';
        const shouldPush = (!prefs || prefs.allowsPush(eventName)) && (!isSilenced || isCritical);
        const shouldEmail = (!prefs || prefs.allowsEmail(eventName)) && recipient.email;
        const priority = getPriority(eventName, type);

        // 2. Persist to DB
        let notification = null;
        if (shouldPersist) {
            notification = await Notification.create({
                recipientId,
                recipientModel,
                title,
                message,
                type,
                link,
                metadata,
                priority
            });
        }

        // 3. Socket.io Push
        if (shouldPush) {
            notifyUser(recipientId, 'new_notification', {
                _id: notification?._id,
                title,
                message,
                type,
                link,
                metadata,
                priority,
                createdAt: notification?.createdAt || new Date()
            });
        }

        // 4. Webhook Integration (Recruiters only for now)
        if (recipientModel === 'Recruiter' && recipient.webhook_url) {
            sendWebhook(recipient.webhook_url, `[Nexus] ${title}`, {
                'Message': message,
                'Status': type,
                'Link': link ? `${process.env.FRONTEND_URL || 'http://localhost:5173'}${link}` : 'N/A',
                'Priority': priority >= 8 ? 'High' : 'Normal'
            });
        }

        // 5. SMS Integration (Critical events)
        if (isCritical && recipient.phone) {
            sendSMS(recipient.phone, `CRITICAL: ${title} - ${message}`);
        }

        // 6. Email Integration (Respect frequency and silence)
        if (shouldEmail) {
            const frequency = prefs?.emailFrequency || 'IMMEDIATE';
            const suppressDueToSilence = isSilenced && !isCritical;

            if ((frequency === 'IMMEDIATE' || isCritical) && !suppressDueToSilence) {
                // Queue immediate email
                emailQueue.add('nexus-notification-email', {
                    email: recipient.email,
                    subject: emailOptions?.subject || title,
                    template: emailOptions?.template || 'alert',
                    context: {
                        name: recipient.name,
                        title: title,
                        message: message,
                        cta: link ? {
                            text: 'View Detail',
                            url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}${link}`
                        } : null,
                        ...(emailOptions?.context || {})
                    }
                });
            } else {
                logger.info(`[notifyDispatcher] Email for ${recipient.email} suppressed (${isSilenced ? 'Quiet Hours' : 'Daily Digest'} active)`);
            }
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

/**
 * Helper to determine notification priority based on event type.
 */
const getPriority = (eventName, type) => {
    // 10: Urgent/Interviews
    if (eventName === 'interview_scheduled' || eventName === 'interview_canceled') return 10;

    // 8: Success/Offer
    if (type === 'SUCCESS' && eventName === 'application_status_update') return 8;

    // 5: General System/Analytics/Announcements
    if (eventName === 'new_announcement' || eventName === 'new_application_received') return 5;

    // 0: Low priority
    if (type === 'INFO' && eventName === 'weekly_digest') return -1;

    return 0;
};

/**
 * Check if the user is currently in a "Quiet Hours" period.
 */
const isInQuietHours = (prefs) => {
    if (!prefs?.quietHours?.enabled) return false;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const { start, end } = prefs.quietHours;

    if (start < end) {
        // Simple case: 08:00 to 22:00
        return currentTime >= start && currentTime <= end;
    } else {
        // Overnight: 22:00 to 08:00
        return currentTime >= start || currentTime <= end;
    }
};

module.exports = { dispatchToUser, dispatchToRole, dispatchToAll };
