const prisma = require('../utils/prisma');

// @desc    Get messages for a conversation
// @route   GET /api/messages/:otherUserId
// @access  Private
const getMessages = async (req, res, next) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: req.user.id, recipientId: req.params.otherUserId },
          { senderId: req.params.otherUserId, recipientId: req.user.id }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });
    res.json(messages.map(m => ({ ...m, _id: m.id, sender: m.senderId, recipient: m.recipientId })));
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res, next) => {
  try {
    const { recipient, content } = req.body;
    const message = await prisma.message.create({
      data: {
        senderId: req.user.id,
        recipientId: recipient,
        content,
      }
    });

    const io = req.app.get('io');
    if (io) {
      io.to(recipient).emit('new_message', { sender: req.user.id, content });
    }

    res.status(201).json({ ...message, _id: message.id });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all conversations for a user
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = async (req, res, next) => {
  try {
    const messages = await prisma.message.findMany({
      where: { OR: [{ senderId: req.user.id }, { recipientId: req.user.id }] },
      include: {
        sender: { select: { id: true, name: true, email: true, role: true } },
        recipient: { select: { id: true, name: true, email: true, role: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const conversations = [];
    const userIds = new Set();

    messages.forEach(msg => {
      const otherUser = msg.senderId === req.user.id ? msg.recipient : msg.sender;
      if (!userIds.has(otherUser.id)) {
        userIds.add(otherUser.id);
        conversations.push({
          user: { ...otherUser, _id: otherUser.id },
          lastMessage: msg.content,
          timestamp: msg.createdAt,
          isRead: msg.recipientId === req.user.id ? msg.isRead : true
        });
      }
    });

    res.json(conversations);
  } catch (error) {
    next(error);
  }
};

module.exports = { getMessages, sendMessage, getConversations };
