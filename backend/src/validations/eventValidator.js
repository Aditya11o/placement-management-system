const { body } = require('express-validator');

exports.validateEventCreation = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Event title is required')
        .isLength({ max: 200 })
        .withMessage('Title cannot exceed 200 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 5000 })
        .withMessage('Description cannot exceed 5000 characters'),
    body('date')
        .notEmpty()
        .withMessage('Event date is required')
        .isISO8601()
        .withMessage('Date must be a valid ISO 8601 date'),
    body('type')
        .optional()
        .isIn(['WEBINAR', 'WORKSHOP', 'PLACEMENT_DRIVE', 'SEMINAR', 'OTHER'])
        .withMessage('Invalid event type')
];
