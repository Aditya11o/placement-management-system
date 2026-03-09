const mongoose = require('mongoose');
const softDeletePlugin = require('./plugins/softDelete');

const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    message: {
        type: String,
        required: [true, 'Please add a message'],
        maxlength: [2000, 'Message cannot be more than 2000 characters']
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ['DRAFT', 'SCHEDULED', 'SENT'],
        default: 'SENT',
        index: true
    },
    scheduled_at: {
        type: Date,
        default: null
    },
    target_roles: {
        type: [String],
        enum: ['STUDENT', 'RECRUITER', 'ADMIN'],
        default: ['STUDENT', 'RECRUITER'],
        index: true
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

announcementSchema.plugin(softDeletePlugin);

module.exports = mongoose.model('Announcement', announcementSchema);
