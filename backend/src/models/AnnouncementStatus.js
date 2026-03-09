const mongoose = require('mongoose');

const announcementStatusSchema = new mongoose.Schema({
    announcement_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Announcement',
        required: true,
        index: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },
    user_role: {
        type: String,
        enum: ['STUDENT', 'RECRUITER', 'ADMIN'],
        required: true
    },
    delivered_at: {
        type: Date,
        default: Date.now
    },
    read_at: {
        type: Date,
        default: null
    }
}, {
    timestamps: false
});

// Compound index for quick lookup of a user's status for a specific announcement
announcementStatusSchema.index({ announcement_id: 1, user_id: 1 }, { unique: true });

module.exports = mongoose.model('AnnouncementStatus', announcementStatusSchema);
