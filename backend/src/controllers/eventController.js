const Event = require('../models/Event');
const logger = require('../utils/logger');

/**
 * @desc    Get all events
 * @route   GET /api/v1/events
 * @access  Private
 */
exports.getEvents = async (req, res, next) => {
    try {
        const events = await Event.find().sort({ startTime: 1 });
        res.status(200).json({
            success: true,
            count: events.length,
            data: events
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Create an event
 * @route   POST /api/v1/events
 * @access  Private/Admin/Recruiter
 */
exports.createEvent = async (req, res, next) => {
    try {
        req.body.created_by = req.user._id;
        const event = await Event.create(req.body);
        res.status(201).json({
            success: true,
            data: event
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Join an event
 * @route   POST /api/v1/events/:id/join
 * @access  Private/Student
 */
exports.joinEvent = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        if (event.attendees.includes(req.user._id)) {
            return res.status(400).json({ success: false, message: 'Already joined this event' });
        }

        event.attendees.push(req.user._id);
        await event.save();

        res.status(200).json({
            success: true,
            message: 'Successfully joined the event'
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Delete an event
 * @route   DELETE /api/v1/events/:id
 * @access  Private/Admin
 */
exports.deleteEvent = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        await event.remove();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        next(err);
    }
};
