const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    recruiter_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recruiter',
        required: true
    },
    application_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application',
        required: true
    },
    job_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    last_message: {
        text: String,
        sender_id: mongoose.Schema.Types.ObjectId,
        sent_at: Date
    },
    unread_count_student: {
        type: Number,
        default: 0
    },
    unread_count_recruiter: {
        type: Number,
        default: 0
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Ensure a student can only have one active conversation per application/job
ConversationSchema.index({ student_id: 1, job_id: 1 }, { unique: true });

module.exports = mongoose.model('Conversation', ConversationSchema);
