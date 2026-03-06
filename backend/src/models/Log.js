const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        // Because a log can refer to differently typed users (Student, Recruiter, Admin),
        // we store the ID as a Generic ObjectId and rely on user_role to parse it if needed.
    },
    user_role: {
        type: String,
        enum: ['STUDENT', 'RECRUITER', 'ADMIN'],
        required: true,
        index: true
    },
    action: {
        type: String,
        required: true,
    },
    target_id: {
        type: mongoose.Schema.Types.ObjectId,
        index: true
    },
    description: {
        type: String,
    },
    ip_address: {
        type: String,
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: false }
});

logSchema.index({ user_id: 1, created_at: -1 });
logSchema.index({ action: 1 });

// Real-time Pulse Feed Broadcast
logSchema.post('save', function (doc) {
    try {
        const { notifyRole } = require('./socketManager');
        // Only broadcast non-admin actions to avoid self-echoing noise on the dashboard
        if (doc.user_role !== 'ADMIN') {
            notifyRole('ADMIN', 'admin_pulse', doc);
        }
    } catch (err) {
        console.error('[Pulse Feed] Failed to emit admin_pulse event:', err.message);
    }
});

module.exports = mongoose.model('Log', logSchema);
