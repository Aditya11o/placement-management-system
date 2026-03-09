const Announcement = require('../models/Announcement');
const AnnouncementStatus = require('../models/AnnouncementStatus');
const Log = require('../models/Log');
const { clearCache } = require('../middlewares/cacheMiddleware');
const { dispatchToAll, dispatchToRole } = require('../services/notifyDispatcher');

exports.getAnnouncements = async (req, res) => {
    try {
        const query = { status: 'SENT' };

        // If it's a student or recruiter, they should only see announcements targeted at their role
        if (req.user.role !== 'ADMIN') {
            query.target_roles = req.user.role;
        }

        const announcements = await Announcement.find(query).sort('-created_at');

        // Enhance with read status if user is student/recruiter
        const data = await Promise.all(announcements.map(async (ann) => {
            const status = await AnnouncementStatus.findOne({
                announcement_id: ann._id,
                user_id: req.user._id
            });
            return {
                ...ann.toObject(),
                isRead: !!status?.read_at
            };
        }));

        res.json({ success: true, count: data.length, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createAnnouncement = async (req, res) => {
    try {
        const { title, message, scheduled_at, target_roles, status: reqStatus } = req.body;

        const isScheduled = !!scheduled_at && new Date(scheduled_at) > new Date();
        const status = reqStatus || (isScheduled ? 'SCHEDULED' : 'SENT');

        const announcement = await Announcement.create({
            title,
            message,
            created_by: req.user._id,
            scheduled_at: isScheduled ? new Date(scheduled_at) : null,
            target_roles: target_roles || ['STUDENT', 'RECRUITER'],
            status
        });

        await Log.create({
            user_id: req.user._id,
            user_role: 'ADMIN',
            action: 'CREATE_ANNOUNCEMENT',
            target_id: announcement._id
        });

        await clearCache('/api/v1/announcements');

        // Only broadcast immediately if status is SENT
        if (status === 'SENT') {
            const payload = {
                _id: announcement._id,
                title: announcement.title,
                message: announcement.message,
                created_at: announcement.created_at
            };

            // Dispatch to specific roles
            announcement.target_roles.forEach(role => {
                dispatchToRole(role, 'new_announcement', payload);
            });
        }

        res.status(201).json({ success: true, data: announcement });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.markAnnouncementRead = async (req, res) => {
    try {
        const status = await AnnouncementStatus.findOneAndUpdate(
            { announcement_id: req.params.id, user_id: req.user._id },
            {
                $set: { read_at: new Date() },
                $setOnInsert: { user_role: req.user.role, delivered_at: new Date() }
            },
            { upsert: true, new: true }
        );

        res.json({ success: true, data: status });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getAnnouncementStats = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) {
            return res.status(404).json({ success: false, message: 'Announcement not found' });
        }

        const stats = await AnnouncementStatus.aggregate([
            { $match: { announcement_id: announcement._id } },
            {
                $group: {
                    _id: null,
                    totalReads: { $sum: { $cond: [{ $gt: ["$read_at", null] }, 1, 0] } },
                    totalDelivered: { $sum: 1 }
                }
            }
        ]);

        const data = stats[0] || { totalReads: 0, totalDelivered: 0 };

        res.json({
            success: true,
            data: {
                announcement_id: announcement._id,
                title: announcement.title,
                stats: {
                    reads: data.totalReads,
                    delivered: data.totalDelivered,
                    readRate: data.totalDelivered > 0 ? (data.totalReads / data.totalDelivered) * 100 : 0
                }
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);

        if (!announcement) {
            return res.status(404).json({ success: false, message: 'Announcement not found' });
        }

        await Announcement.deleteOne({ _id: announcement._id });
        await AnnouncementStatus.deleteMany({ announcement_id: announcement._id });

        await Log.create({
            user_id: req.user._id,
            user_role: 'ADMIN',
            action: 'DELETE_ANNOUNCEMENT',
            target_id: req.params.id
        });

        await clearCache('/api/v1/announcements');

        res.json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
