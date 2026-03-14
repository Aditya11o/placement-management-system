const PrepRoom = require('../models/PrepRoom');
const logger = require('../utils/logger');

/**
 * @desc    Create a new Prep Room
 * @route   POST /api/v1/students/prep-rooms
 * @access  Private (Student)
 */
exports.createRoom = async (req, res, next) => {
    try {
        const { title, topic, max_participants } = req.body;

        const room = await PrepRoom.create({
            title,
            topic,
            max_participants: max_participants || 5,
            host: req.user.id,
            participants: [req.user.id]
        });

        res.status(201).json({
            success: true,
            data: room
        });
    } catch (error) {
        logger.error(`Error creating prep room: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * @desc    Get all open Prep Rooms
 * @route   GET /api/v1/students/prep-rooms
 * @access  Private (Student)
 */
exports.getRooms = async (req, res, next) => {
    try {
        const rooms = await PrepRoom.find({ status: 'OPEN' })
            .populate('host', 'name profile_image_url')
            .sort('-created_at');

        res.status(200).json({
            success: true,
            count: rooms.length,
            data: rooms
        });
    } catch (error) {
        logger.error(`Error fetching prep rooms: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * @desc    Get room details
 * @route   GET /api/v1/students/prep-rooms/:id
 * @access  Private (Student)
 */
exports.getRoomById = async (req, res, next) => {
    try {
        const room = await PrepRoom.findById(req.params.id)
            .populate('host', 'name profile_image_url')
            .populate('participants', 'name profile_image_url');

        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }

        res.status(200).json({
            success: true,
            data: room
        });
    } catch (error) {
        logger.error(`Error fetching room details: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * @desc    Join a Prep Room
 * @route   POST /api/v1/students/prep-rooms/:id/join
 * @access  Private (Student)
 */
exports.joinRoom = async (req, res, next) => {
    try {
        let room = await PrepRoom.findById(req.params.id);

        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }

        if (room.status === 'CLOSED') {
            return res.status(400).json({ success: false, message: 'Room is closed' });
        }

        if (room.participants.length >= room.max_participants) {
            return res.status(400).json({ success: false, message: 'Room is full' });
        }

        if (!room.participants.includes(req.user.id)) {
            room.participants.push(req.user.id);
            await room.save();
        }

        res.status(200).json({
            success: true,
            data: room
        });
    } catch (error) {
        logger.error(`Error joining room: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
