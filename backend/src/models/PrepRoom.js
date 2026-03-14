const mongoose = require('mongoose');

const prepRoomSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a room title'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    topic: {
        type: String,
        enum: ['TECHNICAL', 'BEHAVIORAL', 'SYSTEM_DESIGN', 'HR_CHITCHAT'],
        default: 'TECHNICAL'
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }],
    status: {
        type: String,
        enum: ['OPEN', 'CLOSED'],
        default: 'OPEN'
    },
    max_participants: {
        type: Number,
        default: 5
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Index for active rooms
prepRoomSchema.index({ status: 1, topic: 1 });

module.exports = mongoose.model('PrepRoom', prepRoomSchema);
