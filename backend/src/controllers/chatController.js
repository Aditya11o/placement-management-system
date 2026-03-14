const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Application = require('../models/Application');
const Job = require('../models/Job');
const { notifyUser } = require('../utils/socketManager');
const logger = require('../utils/logger');

/**
 * @desc    Initiate or get chat conversation
 * @route   POST /api/v1/chat/initiate
 * @access  Private
 */
exports.initiateChat = async (req, res, next) => {
    try {
        const { applicationId } = req.body;
        const studentId = req.user.id;

        const application = await Application.findById(applicationId).populate('job_id');
        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        // 1. Eligibility Check (High-intent only)
        const allowedStatuses = ['SHORTLISTED', 'SELECTED', 'OFFERED', 'HIRED', 'ACCEPTED'];
        if (!allowedStatuses.includes(application.status)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Chat is only available for shortlisted or selected candidates.' 
            });
        }

        const jobId = application.job_id._id;
        const recruiterId = application.job_id.created_by;

        // 2. Find or Create Conversation
        let conversation = await Conversation.findOne({ student_id: studentId, job_id: jobId });

        if (!conversation) {
            conversation = await Conversation.create({
                student_id: studentId,
                recruiter_id: recruiterId,
                application_id: applicationId,
                job_id: jobId
            });
        }

        res.status(200).json({ success: true, data: conversation });
    } catch (err) {
        logger.error(`[chatController] initiateChat: ${err.message}`);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * @desc    Get all conversations for current user
 * @route   GET /api/v1/chat/conversations
 * @access  Private
 */
exports.getConversations = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;

        const query = role === 'STUDENT' ? { student_id: userId } : { recruiter_id: userId };
        
        const conversations = await Conversation.find(query)
            .populate('student_id', 'name email profile_image')
            .populate('recruiter_id', 'name email company_name')
            .populate('job_id', 'title company')
            .sort({ updatedAt: -1 });

        res.status(200).json({ success: true, data: conversations });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get messages for a conversation
 * @route   GET /api/v1/chat/conversations/:id/messages
 * @access  Private
 */
exports.getMessages = async (req, res, next) => {
    try {
        const conversationId = req.params.id;
        const userId = req.user.id;

        // 1. Check access
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });

        if (conversation.student_id.toString() !== userId && conversation.recruiter_id.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        // 2. Mark messages as read
        const role = req.user.role;
        await Message.updateMany(
            { conversation_id: conversationId, sender_id: { $ne: userId } },
            { is_read: true }
        );

        // Reset unread count
        if (role === 'STUDENT') {
            conversation.unread_count_student = 0;
        } else {
            conversation.unread_count_recruiter = 0;
        }
        await conversation.save();

        const messages = await Message.find({ conversation_id: conversationId }).sort({ sent_at: 1 });

        res.status(200).json({ success: true, data: messages });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Send a message
 * @route   POST /api/v1/chat/conversations/:id/messages
 * @access  Private
 */
exports.sendMessage = async (req, res, next) => {
    try {
        const conversationId = req.params.id;
        const { text } = req.body;
        const senderId = req.user.id;
        const senderModel = req.user.role === 'STUDENT' ? 'Student' : 'Recruiter';

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });

        // 1. Create message
        const message = await Message.create({
            conversation_id: conversationId,
            sender_id: senderId,
            sender_model: senderModel,
            text,
            message_type: req.body.message_type || 'TEXT',
            file_url: req.body.file_url || null
        });

        // 2. Update conversation
        const recipientId = senderModel === 'Student' ? conversation.recruiter_id : conversation.student_id;
        
        if (senderModel === 'Student') {
            conversation.unread_count_recruiter += 1;
        } else {
            conversation.unread_count_student += 1;
        }

        conversation.last_message = {
            text,
            sender_id: senderId,
            sent_at: message.sent_at
        };
        await conversation.save();

        // 3. Real-time Delivery via Socket.io
        notifyUser(recipientId, 'chat:message', {
            conversationId,
            message: {
                _id: message._id,
                text: message.text,
                sender_id: senderId,
                sender_model: senderModel,
                sent_at: message.sent_at,
                message_type: message.message_type,
                file_url: message.file_url
            }
        });

        res.status(201).json({ success: true, data: message });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Check online status of a user
 * @route   GET /api/v1/chat/online-status/:id
 * @access  Private
 */
exports.getOnlineStatus = async (req, res, next) => {
    try {
        const { isUserOnline } = require('../utils/socketManager');
        const isOnline = isUserOnline(req.params.id);
        res.status(200).json({ success: true, data: { isOnline } });
    } catch (err) {
        next(err);
    }
};
