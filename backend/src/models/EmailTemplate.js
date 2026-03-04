const mongoose = require('mongoose');

const EmailTemplateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a unique template name'],
        unique: true,
        trim: true
    },
    subject: {
        type: String,
        required: [true, 'Please provide an email subject line']
    },
    htmlContent: {
        type: String,
        required: [true, 'Please provide the HTML body content of the template']
    },
    variables: {
        type: [String],
        default: []
    },
    description: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('EmailTemplate', EmailTemplateSchema);
