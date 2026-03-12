const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'user_model'
    },
    user_model: {
        type: String,
        required: true,
        enum: ['Student', 'Recruiter', 'Admin']
    },
    refresh_token: {
        type: String,
        required: true
    },
    device_info: {
        browser: String,
        os: String,
        device: String
    },
    ip_address: {
        type: String
    },
    expires_at: {
        type: Date,
        required: true
    }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Index for fast session lookups during token refresh
sessionSchema.index({ refresh_token: 1 });

// Auto-delete expired sessions using TTL index
sessionSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Session', sessionSchema);
