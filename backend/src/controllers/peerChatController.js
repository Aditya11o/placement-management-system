const PeerConversation = require('../models/PeerConversation');
const Message = require('../models/Message');
const Student = require('../models/Student');
const logger = require('../utils/logger');
const { notifyUser } = require('../utils/socketManager');

/**
 * @desc    Initiate a conversation with an Alumnus/Peer
 * @route   POST /api/v1/students/peer-chat/initiate
 * @access  Private (Student)
 */
exports.initiatePeerChat = async (req, res, next) => {
    try {
        const { recipientId } = req.body;
        
        if (recipientId === req.user.id) {
            return res.status(400).json({ success: false, message: 'Cannot chat with yourself' });
        }

        // Check if conversation already exists
        let conversation = await PeerConversation.findOne({
            participants: { $all: [req.user.id, recipientId] }
        });

        if (!conversation) {
            conversation = await PeerConversation.create({
                participants: [req.user.id, recipientId]
            });
        }

        res.status(200).json({
            success: true,
            data: conversation
        });
    } catch (error) {
        logger.error(`Error initiating peer chat: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * @desc    Get all peer conversations for current student
 * @route   GET /api/v1/students/peer-chat/conversations
 * @access  Private (Student)
 */
exports.getPeerConversations = async (req, res, next) => {
    try {
        const conversations = await PeerConversation.find({
            participants: req.user.id
        })
        .populate('participants', 'name profile_image_url branch is_placed')
        .sort('-updated_at');

        res.status(200).json({
            success: true,
            data: conversations
        });
    } catch (error) {
        logger.error(`Error fetching peer conversations: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * @desc    Send a message in a peer conversation
 * @route   POST /api/v1/students/peer-chat/conversations/:id/messages
 * @access  Private (Student)
 */
exports.sendPeerMessage = async (req, res, next) => {
    try {
        const { text } = req.body;
        const conversation = await PeerConversation.findById(req.params.id);

        if (!conversation || !conversation.participants.includes(req.user.id)) {
            return res.status(404).json({ success: false, message: 'Conversation not found' });
        }

        const message = await Message.create({
            conversation_id: conversation._id,
            sender_id: req.user.id,
            sender_model: 'Student', // Both are students in this system
            text
        });

        // Update conversation summary
        conversation.last_message = {
            text,
            sender_id: req.user.id,
            sent_at: new Date()
        };
        
        // Update unread counts for participants other than sender
        conversation.participants.forEach(pId => {
            if (pId.toString() !== req.user.id.toString()) {
                const currentCount = conversation.unread_counts.get(pId.toString()) || 0;
                conversation.unread_counts.set(pId.toString(), currentCount + 1);
                
                // Real-time notification via socket
                notifyUser(pId, 'peer_chat:message', {
                    conversationId: conversation._id,
                    message
                });
            }
        });

        await conversation.save();

        res.status(201).json({
            success: true,
            data: message
        });
    } catch (error) {
        logger.error(`Error sending peer message: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * @desc    Get messages for a peer conversation
 * @route   GET /api/v1/students/peer-chat/conversations/:id/messages
 * @access  Private (Student)
 */
exports.getPeerMessages = async (req, res, next) => {
    try {
        const conversation = await PeerConversation.findById(req.params.id);

        if (!conversation || !conversation.participants.includes(req.user.id)) {
            return res.status(404).json({ success: false, message: 'Conversation not found' });
        }

        // Reset unread count for current user
        conversation.unread_counts.set(req.user.id.toString(), 0);
        await conversation.save();

        const messages = await Message.find({ conversation_id: conversation._id })
            .sort('sent_at');

        res.status(200).json({
            success: true,
            data: messages
        });
    } catch (error) {
        logger.error(`Error fetching peer messages: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
