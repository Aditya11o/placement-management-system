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
    },
    avatar: {
        type: String
    },
    actions: [{
        label: { type: String, required: true },
        url: { type: String, required: true },
        method: { type: String, enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], default: 'POST' },
        color: { type: String, default: 'indigo' }
    }],
    metadata: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    },
    priority: {
        type: Number,
        default: 0,
        index: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
