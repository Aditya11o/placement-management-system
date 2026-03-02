const Announcement = require('../models/Announcement');
const Log = require('../models/Log');
const { clearCache } = require('../middlewares/cacheMiddleware');
const { dispatchToAll } = require('../services/notifyDispatcher');

exports.getAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find({}).sort('-created_at');
        res.json({ success: true, count: announcements.length, data: announcements });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createAnnouncement = async (req, res) => {
    try {
        const { title, message } = req.body;

        const announcement = await Announcement.create({
            title,
            message,
            created_by: req.user._id
        });

        await Log.create({
            user_id: req.user._id,
            user_role: 'ADMIN',
            action: 'CREATE_ANNOUNCEMENT',
            target_id: announcement._id
        });

        await clearCache('/api/v1/announcements');

        // 📢 Broadcast to ALL connected users instantly (Students, Recruiters, Admins see the toast)
        dispatchToAll('new_announcement', {
            _id: announcement._id,
            title: announcement.title,
            message: announcement.message,
            created_at: announcement.created_at
        });

        res.status(201).json({ success: true, data: announcement });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
