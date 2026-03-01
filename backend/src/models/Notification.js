const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'recipientModel'
    },
    recipientModel: {
        type: String,
        required: true,
        enum: ['Student', 'Recruiter', 'Admin']
    },
    title: {
        type: String,
        required: [true, 'Please add a notification title']
    },
    message: {
        type: String,
        required: [true, 'Please add a notification message']
    },
    type: {
        type: String,
        enum: ['INFO', 'SUCCESS', 'WARNING', 'ERROR'],
        default: 'INFO'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    link: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
