const { check } = require('express-validator');

exports.validateAnnouncementCreation = [
    check('title', 'Title is required').not().isEmpty().trim().escape(),
    check('message', 'Message is required').not().isEmpty().trim().escape(),
    check('scheduled_at', 'Invalid scheduled date').optional({ checkFalsy: true }).isISO8601(),
    check('target_roles', 'Target roles must be an array').optional().isArray()
];
