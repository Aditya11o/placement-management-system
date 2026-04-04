const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');
const { convert } = require('html-to-text');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  let html;
  if (options.template) {
    const templatePath = path.join(__dirname, '../templates/emails', `${options.template}.ejs`);
    const layoutPath = path.join(__dirname, '../templates/emails/layout.ejs');
    
    // Render the specific template body
    const body = await ejs.renderFile(templatePath, options.context || {});
    
    // Render the full layout with the body
    html = await ejs.renderFile(layoutPath, {
      body,
      subject: options.subject,
      ...(options.context || {})
    });
  } else {
    html = options.message;
  }

  // Generate plain text version
  const text = convert(html, {
    wordwrap: 130,
    selectors: [
      { selector: 'a', options: { hideLinkHrefIfSameAsText: true } }
    ]
  });

  const message = {
    from: process.env.EMAIL_FROM || `"Placement Cell" <${process.env.SMTP_USER}>`,
    to: options.email,
    subject: options.subject,
    html,
    text
  };

  const info = await transporter.sendMail(message);
  console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;
