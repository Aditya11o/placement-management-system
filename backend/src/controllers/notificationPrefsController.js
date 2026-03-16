const NotificationPrefs = require('../models/NotificationPrefs');

// ── Available configurable events ─────────────────────────────────────────────
const CONFIGURABLE_EVENTS = {
    student: [
        { key: 'application_status_update', label: 'Application status updates', channels: ['push', 'email'] },
        { key: 'interview_scheduled', label: 'Interview scheduled', channels: ['push', 'email'] },
        { key: 'interview_canceled', label: 'Interview canceled', channels: ['push', 'email'] },
        { key: 'new_job_posted', label: 'New job opportunities', channels: ['push'] },
        { key: 'new_announcement', label: 'System announcements', channels: ['push'] },
        { key: 'weekly_digest', label: 'Weekly placement digest', channels: ['email'] }
    ],
    recruiter: [
        { key: 'new_application_received', label: 'New applications received', channels: ['push'] },
        { key: 'high_match_alert', label: 'High-match applications (≥80%)', channels: ['push'] },
        { key: 'new_announcement', label: 'System announcements', channels: ['push'] },
        { key: 'weekly_digest', label: 'Weekly digest', channels: ['email'] }
    ],
    admin: [
        { key: 'weekly_digest', label: 'Weekly digest', channels: ['email'] }
    ]
};

/**
 * @desc    Get current user's notification preferences
 * @route   GET /api/v1/notification-prefs
 * @access  Private
 */
exports.getPrefs = async (req, res, next) => {
    try {
        const userModel = req.user.role === 'STUDENT' ? 'Student'
            : req.user.role === 'RECRUITER' ? 'Recruiter' : 'Admin';

        const prefs = await NotificationPrefs.getOrCreate(req.user._id, userModel);
        const events = CONFIGURABLE_EVENTS[req.user.role.toLowerCase()] || [];

        res.status(200).json({
            success: true,
            data: {
                userId: req.user._id,
                role: req.user.role,
                preferences: prefs.toObject(),
                availableEvents: events,
                emailFrequency: prefs.emailFrequency,
                quietHours: prefs.quietHours
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Update current user's notification preferences
 * @route   PUT /api/v1/notification-prefs
 * @access  Private
 *
 * Body: flat or nested preference map, e.g.
 *   { "application_status_update": { "push": true, "email": false }, "weekly_digest": false }
 */
exports.updatePrefs = async (req, res, next) => {
    try {
        const userModel = req.user.role === 'STUDENT' ? 'Student'
            : req.user.role === 'RECRUITER' ? 'Recruiter' : 'Admin';

        const allowedEvents = (CONFIGURABLE_EVENTS[req.user.role.toLowerCase()] || [])
            .map(e => e.key);

        // Whitelist recognized event keys and top-level fields
        const updates = {};
        for (const [key, value] of Object.entries(req.body)) {
            if (key === 'emailFrequency') {
                if (['IMMEDIATE', 'DAILY', 'WEEKLY'].includes(value)) updates.emailFrequency = value;
                continue;
            }
            if (key === 'quietHours') {
                updates.quietHours = { ...req.user.quietHours, ...value };
                continue;
            }

            if (!allowedEvents.includes(key)) continue;

            // Accept either boolean (simple toggle) or { push, email } objects
            if (typeof value === 'boolean') {
                updates[key] = value;
            } else if (typeof value === 'object' && value !== null) {
                updates[key] = {};
                if (typeof value.push === 'boolean') updates[key].push = value.push;
                if (typeof value.email === 'boolean') updates[key].email = value.email;
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid preference keys provided',
                allowedEvents
            });
        }

        const prefs = await NotificationPrefs.findOneAndUpdate(
            { userId: req.user._id },
            { $set: updates },
            { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Notification preferences updated',
            data: prefs
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Reset all preferences to default (all enabled)
 * @route   DELETE /api/v1/notification-prefs
 * @access  Private
 */
exports.resetPrefs = async (req, res, next) => {
    try {
        const userModel = req.user.role === 'STUDENT' ? 'Student'
            : req.user.role === 'RECRUITER' ? 'Recruiter' : 'Admin';

        await NotificationPrefs.findOneAndDelete({ userId: req.user._id });
        const fresh = await NotificationPrefs.getOrCreate(req.user._id, userModel);

        res.status(200).json({
            success: true,
            message: 'Notification preferences reset to defaults',
            data: fresh
        });
    } catch (err) {
        next(err);
    }
};
