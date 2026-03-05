const { webhookQueue } = require('./webhookQueue');
const logger = require('./logger');

/**
 * Sends a formatted alert to the configured system webhook (Slack/Discord)
 * @param {string} url - The Webhook URL from GlobalSettings
 * @param {string} message - The message text
 * @param {Object} [fields] - Optional key-value pairs to display as fields/embeds
 */
exports.sendSystemAlert = async (url, message, fields = {}) => {
    if (!url) return;

    try {
        // Construct Slack/Discord compatible payload
        // Slack uses "text" or "blocks", Discord uses "content" or "embeds"
        // This simple payload works for both as the primary message text
        const payload = {
            text: message, // Slack primary
            content: message, // Discord primary
            username: 'Nexus PMS Bot',
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

        await webhookQueue.add('system-alert', {
            url,
            payload
        });

        logger.info(`System alert queued for webhook: ${message}`);
    } catch (err) {
        logger.error(`Failed to queue system alert: ${err.message}`);
    }
};
