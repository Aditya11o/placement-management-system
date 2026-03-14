const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    conversation_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true
    },
    sender_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    sender_model: {
        type: String,
        enum: ['Student', 'Recruiter'],
        required: true
    },
    text: {
        type: String,
        trim: true
    },
    message_type: {
        type: String,
        enum: ['TEXT', 'FILE'],
        default: 'TEXT'
    },
    file_url: {
        type: String,
        default: null
    },
    is_read: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: { createdAt: 'sent_at', updatedAt: false }
});

MessageSchema.index({ conversation_id: 1, sent_at: 1 });

module.exports = mongoose.model('Message', MessageSchema);
