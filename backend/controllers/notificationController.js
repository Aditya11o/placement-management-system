const prisma = require('../utils/prisma');
const { parsePagination } = require('../utils/pagination');
const crypto = require('crypto');

// @desc    Get my notifications
// @route   GET /api/notifications
// @access  Private
const getMyNotifications = async (req, res, next) => {
  try {
    const { skip, limit, paginate } = parsePagination(req.query);
    const where = { userId: req.user.id };

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.notification.count({ where })
    ]);

    const formatted = notifications.map(n => ({ ...n, _id: n.id, user_id: n.userId, is_read: n.isRead }));
    res.json(paginate(formatted, total));
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/read/:id
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true }
    });
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all/:userId
// @access  Private
const markAllAsRead = async (req, res, next) => {
  try {
    const targetUserId = req.params.userId;
    if (req.user.role !== 'admin' && targetUserId !== req.user.id) {
       return res.status(403).json({ message: 'Not authorized' });
    }

    await prisma.notification.updateMany({
      where: { userId: targetUserId, isRead: false },
      data: { isRead: true }
    });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

// @desc    Create broadcast notification (Admin)
// @route   POST /api/notifications/broadcast
// @access  Private (Admin)
const createBroadcast = async (req, res, next) => {
  try {
    const { title, message, body, type, sendTo } = req.body;
    let where = {};
    if (sendTo === 'All Students') where.role = 'student';
    else if (sendTo === 'All Recruiters') where.role = 'recruiter';

    const recipients = await prisma.user.findMany({ where, select: { id: true } });
    const broadcastId = crypto.randomUUID();

    await prisma.notification.createMany({
      data: recipients.map(user => ({
        userId: user.id,
        title: title || 'Broadcast',
        message: message || body,
        type: (type || 'system').toLowerCase(),
        isBroadcast: true,
        broadcastId
      }))
    });

    const io = req.app.get('io');
    if (io) {
      recipients.forEach(u => io.to(u.id).emit('notification', { title, message, type, broadcastId }));
    }

    res.status(201).json({ message: `Broadcast sent to ${recipients.length} users`, broadcastId });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all broadcast notifications (Announcements)
// @route   GET /api/notifications/announcements
// @access  Private
const getAnnouncements = async (req, res, next) => {
  try {
    const { skip, limit, paginate } = parsePagination(req.query);
    const where = { isBroadcast: true };

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where, orderBy: { createdAt: 'desc' }, skip, take: limit
      }),
      prisma.notification.count({ where })
    ]);

    const formatted = notifications.map(n => ({ ...n, _id: n.id, user_id: n.userId }));
    res.json(paginate(formatted, total));
  } catch (error) {
    next(error);
  }
};

// @desc    Get unique broadcasts for admin history
// @route   GET /api/notifications/admin
const adminGetBroadcasts = async (req, res, next) => {
  try {
    const broadcasts = await prisma.notification.groupBy({
      by: ['broadcastId', 'title', 'message', 'type', 'createdAt'],
      where: { isBroadcast: true, NOT: { broadcastId: null } },
      _count: { userId: true },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = broadcasts.map(b => ({
      _id: b.broadcastId,
      title: b.title,
      message: b.message,
      type: b.type,
      createdAt: b.createdAt,
      recipientCount: b._count.userId
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a broadcast
// @route   PUT /api/notifications/broadcast/:id
const updateBroadcast = async (req, res, next) => {
  try {
    const { title, message, type } = req.body;
    const { id: broadcastId } = req.params;

    const result = await prisma.notification.updateMany({
      where: { broadcastId },
      data: { title, message, type: (type || 'system').toLowerCase() }
    });

    res.json({ message: `Broadcast updated successfully (${result.count} recipients updated)` });
  } catch (error) {
    next(error);
  }
};

const deleteBroadcast = async (req, res, next) => {
  try {
    const { id: broadcastId } = req.params;
    const result = await prisma.notification.deleteMany({ where: { broadcastId } });
    res.json({ message: `Broadcast deleted successfully (${result.count} notifications removed)` });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  getMyNotifications, 
  markAsRead, 
  markAllAsRead,
  createBroadcast, 
  getAnnouncements,
  adminGetBroadcasts,
  updateBroadcast,
  deleteBroadcast
};
