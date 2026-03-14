const mongoose = require('mongoose');

const peerConversationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    }],
    last_message: {
        text: String,
        sender_id: mongoose.Schema.Types.ObjectId,
        sent_at: Date
    },
    unread_counts: {
        type: Map,
        of: Number,
        default: {}
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Ensure only one conversation exists between any two students
peerConversationSchema.index({ participants: 1 });

module.exports = mongoose.model('PeerConversation', peerConversationSchema);
