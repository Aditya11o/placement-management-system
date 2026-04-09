const prisma = require('../utils/prisma');
const { parsePagination } = require('../utils/pagination');

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
    const { title, message, body, type, sendTo, scheduledAt } = req.body;
    const finalMessage = message || body;
    const targetRole = sendTo === 'All Students' ? 'student' : (sendTo === 'All Recruiters' ? 'recruiter' : 'all');
    
    const isScheduled = scheduledAt && new Date(scheduledAt) > new Date();

    // 1. Create the Broadcast record
    const broadcast = await prisma.broadcast.create({
      data: {
        title: title || 'Broadcast',
        message: finalMessage,
        type: (type || 'system').toLowerCase(),
        targetRole,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
        isSent: !isScheduled
      }
    });

    if (!isScheduled) {
      // Send immediately
      let where = {};
      if (targetRole === 'student') where.role = 'student';
      else if (targetRole === 'recruiter') where.role = 'recruiter';

      const recipients = await prisma.user.findMany({ where, select: { id: true } });

      if (recipients.length > 0) {
        await prisma.notification.createMany({
          data: recipients.map(user => ({
            userId: user.id,
            title: title || 'Broadcast',
            message: finalMessage,
            type: (type || 'system').toLowerCase(),
            isBroadcast: true,
            broadcastId: broadcast.id
          }))
        });

        const io = req.app.get('io');
        if (io) {
          recipients.forEach(u => io.to(u.id.toString()).emit('notification', { 
            title: title || 'Broadcast', 
            message: finalMessage, 
            type, 
            broadcastId: broadcast.id 
          }));
        }
      }
      return res.status(201).json({ 
        message: `Broadcast sent immediately to ${recipients.length} users`, 
        broadcastId: broadcast.id 
      });
    }

    res.status(201).json({ 
      message: `Broadcast scheduled for ${new Date(scheduledAt).toLocaleString()}`, 
      broadcastId: broadcast.id 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all broadcast notifications (Announcements) for users
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

// @desc    Get all broadcasts for admin management (from Broadcast table)
// @route   GET /api/notifications/admin
const adminGetBroadcasts = async (req, res, next) => {
  try {
    const broadcasts = await prisma.broadcast.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { notifications: true }
        }
      }
    });

    const formatted = broadcasts.map(b => ({
      _id: b.id,
      title: b.title,
      message: b.message,
      type: b.type,
      targetRole: b.targetRole,
      scheduledAt: b.scheduledAt,
      isSent: b.isSent,
      createdAt: b.createdAt,
      recipientCount: b._count.notifications
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a broadcast (only if not sent, or updates existing notifications if already sent)
// @route   PUT /api/notifications/broadcast/:id
const updateBroadcast = async (req, res, next) => {
  try {
    const { title, message, type, scheduledAt, sendTo } = req.body;
    const { id: broadcastId } = req.params;

    const existing = await prisma.broadcast.findUnique({ where: { id: broadcastId } });
    if (!existing) return res.status(404).json({ message: 'Broadcast not found' });

    const targetRole = sendTo === 'All Students' ? 'student' : (sendTo === 'All Recruiters' ? 'recruiter' : 'all');

    const updated = await prisma.broadcast.update({
      where: { id: broadcastId },
      data: { 
        title, 
        message, 
        type: type?.toLowerCase(), 
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        targetRole 
      }
    });

    // If it was already sent, update existing notifications too
    if (existing.isSent) {
      await prisma.notification.updateMany({
        where: { broadcastId },
        data: { title, message, type: type?.toLowerCase() }
      });
    }

    res.json({ message: 'Broadcast updated successfully', broadcast: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a broadcast
// @route   DELETE /api/notifications/broadcast/:id
const deleteBroadcast = async (req, res, next) => {
  try {
    const { id: broadcastId } = req.params;

    // Cascade delete notifications linked to this broadcast
    await prisma.notification.deleteMany({ where: { broadcastId } });
    await prisma.broadcast.delete({ where: { id: broadcastId } });

    res.json({ message: 'Broadcast and associated notifications deleted successfully' });
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
