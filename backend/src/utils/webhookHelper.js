const { webhookQueue } = require('./webhookQueue');
const logger = require('./logger');

/**
 * Internal generic helper to queue a webhook job
 */
const queueWebhook = async (url, message, fields = {}, username = 'Nexus PMS Bot') => {
    if (!url) return;

    try {
        const payload = {
            text: message,
            content: message,
            username,
            attachments: Object.keys(fields).length > 0 ? [
                {
                    color: '#4f46e5',
                    fields: Object.entries(fields).map(([title, value]) => ({
                        title,
                        value: String(value),
                        short: true
                    }))
                }
            ] : []
        };

        await webhookQueue.add('webhook-alert', {
            url,
            payload
        });

        logger.info(`Webhook alert queued: ${message}`);
    } catch (err) {
        logger.error(`Failed to queue webhook: ${err.message}`);
    }
};

/**
 * Sends a formatted alert to the configured system webhook (Slack/Discord)
 */
exports.sendSystemAlert = async (url, message, fields = {}) => {
    return queueWebhook(url, message, fields, 'Nexus System');
};

/**
 * Sends a formatted alert to a User/Recruiter defined webhook
 */
exports.sendWebhook = async (url, message, fields = {}, username = 'Nexus Notification') => {
    return queueWebhook(url, message, fields, username);
};
