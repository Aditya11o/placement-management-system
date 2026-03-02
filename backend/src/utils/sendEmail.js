const nodemailer = require('nodemailer');
const config = require('../config/config');

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: config.get('smtp.host'),
        port: config.get('smtp.port'),
        auth: {
            user: config.get('smtp.email'),
            pass: config.get('smtp.password'),
        },
    });

    const message = {
        from: `${config.get('from.name')} <${config.get('from.email')}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
    };

    const info = await transporter.sendMail(message);

    console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;
