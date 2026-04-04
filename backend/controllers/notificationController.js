const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { parsePagination } = require('../utils/pagination');

// @desc    Get my notifications
// @route   GET /api/notifications
// @access  Private
const getMyNotifications = async (req, res, next) => {
  try {
    const { skip, limit, paginate } = parsePagination(req.query);
    const query = { user_id: req.user.id };

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments(query)
    ]);

    res.json(paginate(notifications, total));
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/read/:id
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (notification && notification.user_id.toString() === req.user.id) {
      notification.is_read = true;
      await notification.save();
      res.json({ message: 'Notification marked as read' });
    } else {
      return res.status(404).json({ message: 'Notification not found' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all/:userId
// @access  Private
const markAllAsRead = async (req, res, next) => {
  try {
    // For security, ensure the userId matches the logged-in user unless admin
    const targetUserId = req.params.userId;
    
    if (req.user.role !== 'admin' && targetUserId !== req.user.id) {
       return res.status(403).json({ message: 'Not authorized to mark these notifications as read' });
    }

    await Notification.updateMany(
      { user_id: targetUserId, is_read: false },
      { $set: { is_read: true } }
    );
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
    
    let query = {};
    if (sendTo === 'All Students') {
      query.role = 'student';
    } else if (sendTo === 'All Recruiters') {
      query.role = 'recruiter';
    } 

    const recipients = await User.find(query).select('_id');
    const broadcastId = new mongoose.Types.ObjectId().toString(); // Generate unique broadcast grouping ID
    
    const notifications = recipients.map(user => ({
      user_id: user._id,
      title: title || 'Broadcast',
      message: message || body,
      type: (type || 'system').toLowerCase(),
      isBroadcast: true,
      broadcastId: broadcastId
    }));

    await Notification.create(notifications);

    // Emit live socket event...
    const io = req.app.get('io');
    if (io) {
      recipients.forEach(user => {
        io.to(user._id.toString()).emit('notification', {
          title: title || 'Broadcast',
          message: message || body,
          type: type || 'system',
          broadcastId: broadcastId
        });
      });
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
    const query = { isBroadcast: true };

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments(query)
    ]);

    res.json(paginate(notifications, total));
  } catch (error) {
    next(error);
  }
};

// @desc    Get unique broadcasts for admin history
// @route   GET /api/notifications/admin
const adminGetBroadcasts = async (req, res, next) => {
  try {
    // Use aggregation to get unique broadcasts by broadcastId
    const broadcasts = await Notification.aggregate([
      { $match: { isBroadcast: true, broadcastId: { $ne: null } } },
      { $sort: { createdAt: -1 } },
      { $group: {
          _id: "$broadcastId",
          title: { $first: "$title" },
          message: { $first: "$message" },
          type: { $first: "$type" },
          createdAt: { $first: "$createdAt" },
          recipientCount: { $sum: 1 }
      }},
      { $sort: { createdAt: -1 } }
    ]);
    res.json(broadcasts);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a broadcast
// @route   PUT /api/notifications/broadcast/:id
const updateBroadcast = async (req, res, next) => {
  try {
    const { title, message, type } = req.body;
    const { id } = req.params; // id is the broadcastId

    const result = await Notification.updateMany(
      { broadcastId: id },
      { $set: { title, message, type: type.toLowerCase() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Broadcast not found' });
    }

    res.json({ message: `Broadcast updated successfully (${result.modifiedCount} recipients updated)` });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a broadcast
// @route   DELETE /api/notifications/broadcast/:id
const deleteBroadcast = async (req, res, next) => {
  try {
    const { id } = req.params; // id is the broadcastId

    const result = await Notification.deleteMany({ broadcastId: id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Broadcast not found' });
    }

    res.json({ message: `Broadcast deleted successfully (${result.deletedCount} notifications removed)` });
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
