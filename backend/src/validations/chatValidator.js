const { body } = require('express-validator');

exports.validateSendMessage = [
    body('content')
        .trim()
        .notEmpty()
        .withMessage('Message content is required')
        .isLength({ max: 5000 })
        .withMessage('Message cannot exceed 5000 characters'),
    body('recipientId')
        .optional()
        .isMongoId()
        .withMessage('Invalid recipient ID format')
];
