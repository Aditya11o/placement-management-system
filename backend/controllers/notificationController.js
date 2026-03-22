const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get my notifications
// @route   GET /api/notifications
// @access  Private
const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (notification && notification.recipient.toString() === req.user.id) {
      notification.isRead = true;
      await notification.save();
      res.json({ message: 'Notification marked as read' });
    } else {
      res.status(404);
      res.json({ message: 'Notification not found' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create broadcast notification (Admin)
// @route   POST /api/notifications/broadcast
// @access  Private (Admin)
const createBroadcast = async (req, res, next) => {
  try {
    const { title, message, body, type, sendTo, course, company } = req.body;
    
    let query = {};
    if (sendTo === 'All Students') {
      query.role = 'student';
    } else if (sendTo === 'All Recruiters') {
      query.role = 'recruiter';
    } else if (sendTo === 'Selected Students') {
      // Logic for selected students could be more complex, but for now let's assume it targets students
      query.role = 'student';
    }

    const recipients = await User.find(query).select('_id');
    
    const notifications = recipients.map(user => ({
      recipient: user._id,
      recipientRole: user.role,
      title: title || 'Broadcast',
      message: message || body,
      type: (type || 'general').toLowerCase(),
      isBroadcast: true
    }));

    await Notification.insertMany(notifications);

    // Emit live socket event
    const io = req.app.get('io');
    recipients.forEach(user => {
      io.to(user._id.toString()).emit('notification', {
        title: title || 'Broadcast',
        message: message || body,
        type: type || 'general',
      });
    });

    res.status(201).json({ message: `Broadcast sent to ${recipients.length} users` });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all broadcast notifications (Admin)
// @route   GET /api/notifications/admin
// @access  Private (Admin)
const adminGetNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ isBroadcast: true })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  getMyNotifications, 
  markAsRead, 
  createBroadcast, 
  adminGetNotifications 
};
