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
    },
    action: {
        type: String,
        required: true,
    },
    target_id: {
        type: mongoose.Schema.Types.ObjectId,
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

module.exports = mongoose.model('Log', logSchema);
