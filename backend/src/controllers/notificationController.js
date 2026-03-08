const Notification = require('../models/Notification');
const PushSubscription = require('../models/PushSubscription');
const webpush = require('web-push');
const axios = require('axios'); // For triggerAction internal requests if needed
const { notifyUser } = require('../utils/socketManager');

// Configure web-push with VAPID keys from .env
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        `mailto:${process.env.EMAIL_FROM || 'admin@nexus.com'}`,
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
}

/**
 * @desc    Get user's notifications (paginated)
 * @route   GET /api/v1/notifications
 * @access  Private
 */
exports.getNotifications = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const notifications = await Notification.find({ recipientId: req.user._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalUnread = await Notification.countDocuments({
            recipientId: req.user._id,
            isRead: false
        });

        const total = await Notification.countDocuments({ recipientId: req.user._id });

        res.status(200).json({
            success: true,
            count: notifications.length,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            },
            totalUnread,
            data: notifications
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Mark a single notification as read
 * @route   PUT /api/v1/notifications/:id/read
 * @access  Private
 */
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        // Ensure notification belongs to user
        if (notification.recipientId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to access this notification' });
        }

        notification.isRead = true;
        await notification.save();

        // Sync other tabs
        notifyUser(req.user._id, 'sync_notification_read', { id: notification._id });

        res.status(200).json({
            success: true,
            data: notification
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Mark all user's unread notifications as read
 * @route   PUT /api/v1/notifications/read-all
 * @access  Private
 */
exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipientId: req.user._id, isRead: false },
            { $set: { isRead: true } }
        );

        // Sync other tabs
        notifyUser(req.user._id, 'sync_all_read', {});

        res.status(200).json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Delete a single notification
 * @route   DELETE /api/v1/notifications/:id
 * @access  Private
 */
exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        // Ensure notification belongs to user
        if (notification.recipientId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this notification' });
        }

        await notification.deleteOne();

        // Sync other tabs
        notifyUser(req.user._id, 'sync_notification_deleted', { id: notification._id });

        res.status(200).json({
            success: true,
            message: 'Notification removed'
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Delete all user's notifications
 * @route   DELETE /api/v1/notifications
 * @access  Private
 */
exports.deleteAllNotifications = async (req, res) => {
    try {
        await Notification.deleteMany({ recipientId: req.user._id });

        // Sync other tabs
        notifyUser(req.user._id, 'sync_all_cleared', {});

        res.status(200).json({
            success: true,
            message: 'All notifications cleared'
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Subscribe to push notifications
 * @route   POST /api/v1/notifications/subscribe
 * @access  Private
 */
exports.subscribePush = async (req, res) => {
    try {
        const { subscription } = req.body;

        if (!subscription || !subscription.endpoint || !subscription.keys) {
            return res.status(400).json({ success: false, message: 'Invalid subscription object' });
        }

        // Save or update subscription
        await PushSubscription.findOneAndUpdate(
            { endpoint: subscription.endpoint },
            {
                userId: req.user._id,
                endpoint: subscription.endpoint,
                keys: subscription.keys,
                expirationTime: subscription.expirationTime
            },
            { upsert: true, new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Push subscription successful'
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Handle actionable notification callback
 * @route   POST /api/v1/notifications/:id/action
 * @access  Private
 */
exports.triggerAction = async (req, res) => {
    try {
        const { actionIdx } = req.body;
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        // Auth check
        if (notification.recipientId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const action = notification.actions[actionIdx];
        if (!action) {
            return res.status(400).json({ success: false, message: 'Action not found' });
        }

        // In a real app, this might be a request to another service.
        // For now, we simulate the logic or navigate the user on frontend.
        // We'll return success and maybe a message.

        res.status(200).json({
            success: true,
            message: `Action '${action.label}' triggered successfully`,
            action: action
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
