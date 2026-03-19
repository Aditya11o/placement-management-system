const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a campaign title for internal reference'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    subject: {
        type: String,
        required: [true, 'Please provide an email subject'],
        trim: true,
        maxlength: [150, 'Subject cannot be more than 150 characters']
    },
    target_audience: {
        type: String,
        required: [true, 'Please specify the target audience shortcut or CUSTOM'],
        enum: ['ALL_STUDENTS', 'APPROVED_STUDENTS', 'UNPLACED_STUDENTS', 'ALL_RECRUITERS', 'CUSTOM'],
        default: 'CUSTOM'
    },
    target_filters: {
        type: mongoose.Schema.Types.Mixed,
        default: {} // Stores branch, cgpa_min, graduation_year, etc.
    },
    channels: {
        type: [String],
        enum: ['EMAIL', 'SMS', 'PUSH'],
        default: ['EMAIL']
    },
    status: {
        type: String,
        enum: ['DRAFT', 'SCHEDULED', 'SENDING', 'COMPLETED', 'FAILED'],
        default: 'DRAFT'
    },
    scheduled_for: {
        type: Date
    },
    html_content: {
        type: String,
        required: [true, 'Please provide the HTML/Text content for the email body']
    },
    total_recipients: {
        type: Number,
        default: 0
    },
    sent_count: {
        type: Number,
        default: 0
    },
    created_by: {
        type: mongoose.Schema.ObjectId,
        ref: 'Admin',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Campaign', campaignSchema);
