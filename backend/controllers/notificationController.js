const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get my notifications
// @route   GET /api/notifications
// @access  Private
const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user_id: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(notifications);
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
      res.status(404).json({ message: 'Notification not found' });
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
    } else if (sendTo === 'Selected Students') {
      query.role = 'student';
    }

    const recipients = await User.find(query).select('_id');
    
    const notifications = recipients.map(user => ({
      user_id: user._id,
      title: title || 'Broadcast',
      message: message || body,
      type: (type || 'system').toLowerCase(),
    }));

    await Notification.insertMany(notifications);

    // Emit live socket event if available
    const io = req.app.get('io');
    if (io) {
      recipients.forEach(user => {
        io.to(user._id.toString()).emit('notification', {
          title: title || 'Broadcast',
          message: message || body,
          type: type || 'system',
        });
      });
    }

    res.status(201).json({ message: `Broadcast sent to ${recipients.length} users` });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all broadcast notifications (Admin)
// @route   GET /api/notifications/admin
// @access  Private (Admin)
const adminGetNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ type: 'system' })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  getMyNotifications, 
  markAsRead, 
  markAllAsRead,
  createBroadcast, 
  adminGetNotifications 
};
