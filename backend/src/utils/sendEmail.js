const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');
const config = require('../config/config');
const logger = require('./logger');

/**
 * Send an email (now supports templates)
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Subject
 * @param {string} [options.message] - Plain text message
 * @param {string} [options.html] - Raw HTML (optional if using template)
 * @param {string} [options.template] - Name of the EJS template (in templates/emails/)
 * @param {Object} [options.context] - Data to pass to the EJS template
 */
const sendEmail = async (options) => {
    const smtpHost = config.get('smtp.host');
    
    // Create transporter configuration
    const transportConfig = {
        auth: {
            user: config.get('smtp.email'),
            pass: config.get('smtp.password'),
        },
    };

    // Use 'service: gmail' for better reliability with Google
    if (smtpHost === 'smtp.gmail.com') {
        transportConfig.service = 'gmail';
    } else {
        transportConfig.host = smtpHost;
        transportConfig.port = config.get('smtp.port');
    }

    const transporter = nodemailer.createTransport(transportConfig);

    let htmlPayload = options.html;

    // Use template if provided
    if (options.template) {
        const templatePath = path.join(__dirname, '..', 'templates', 'emails', `${options.template}.ejs`);
        const bodyContent = await ejs.renderFile(templatePath, options.context || {});
        
        // Wrap in base.ejs if it exists
        const baseWrapperPath = path.join(__dirname, '..', 'templates', 'emails', 'base.ejs');
        try {
            htmlPayload = await ejs.renderFile(baseWrapperPath, { body: bodyContent });
        } catch (err) {
            logger.warn('Could not find or render base.ejs, sending raw template content');
            htmlPayload = bodyContent;
        }
    }

    const message = {
        from: `${config.get('from.name')} <${config.get('from.email')}>`,
        to: options.email,
        subject: options.subject,
        text: options.message || 'No clear text content provided',
        html: htmlPayload,
    };

    try {
        const info = await transporter.sendMail(message);
        logger.info(`Email sent to ${options.email}: ${info.messageId}`);
        return info;
    } catch (err) {
        logger.error(`Error sending email to ${options.email}: ${err.message}`);
        throw err;
    }
};

module.exports = sendEmail;
