const Message = require('../models/Message');

// @desc    Get messages for a conversation
// @route   GET /api/messages/:otherUserId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, recipient: req.params.otherUserId },
        { sender: req.params.otherUserId, recipient: req.user.id }
      ]
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { recipient, content } = req.body;
    const message = await Message.create({
      sender: req.user.id,
      recipient,
      content,
    });

    // Emit live socket event to the recipient
    const io = req.app.get('io');
    io.to(recipient.toString()).emit('new_message', {
      sender: req.user.id,
      content,
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all conversations for a user
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user.id }, { recipient: req.user.id }]
    })
    .sort({ createdAt: -1 })
    .populate('sender', 'name email role')
    .populate('recipient', 'name email role');

    const conversations = [];
    const userIds = new Set();

    messages.forEach(msg => {
      const otherUser = msg.sender._id.toString() === req.user.id ? msg.recipient : msg.sender;
      if (!userIds.has(otherUser._id.toString())) {
        userIds.add(otherUser._id.toString());
        conversations.push({
          user: otherUser,
          lastMessage: msg.content,
          timestamp: msg.createdAt,
          isRead: msg.recipient.toString() === req.user.id ? msg.isRead : true
        });
      }
    });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMessages, sendMessage, getConversations };
