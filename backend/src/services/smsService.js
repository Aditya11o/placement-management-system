const twilio = require('twilio');
const config = require('../config/config');
const logger = require('../utils/logger');

// Initialize Twilio client lazily to avoid errors if credentials are missing during startup
let client = null;

const getClient = () => {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;

    if (!sid || !token) {
        return null;
    }

    if (!client) {
        client = twilio(sid, token);
    }
    return client;
};

/**
 * Sends an SMS message to a specific phone number
 * @param {string} to - Recipient phone number (E.164 format)
 * @param {string} body - The message content
 */
exports.sendSMS = async (to, body) => {
    const twilioClient = getClient();
    const from = process.env.TWILIO_PHONE_NUMBER;

    if (!twilioClient || !from) {
        logger.warn('[smsService] Twilio credentials missing, SMS skipped');
        return;
    }

    try {
        const message = await twilioClient.messages.create({
            body,
            from,
            to
        });
        logger.info(`[smsService] SMS sent to ${to}: ${message.sid}`);
        return message;
    } catch (err) {
        logger.error(`[smsService] Failed to send SMS to ${to}: ${err.message}`);
    }
};
