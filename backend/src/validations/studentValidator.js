const { body } = require('express-validator');

exports.validateProfileUpdate = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
    body('phone')
        .optional()
        .trim()
        .matches(/^[0-9+\-() ]{7,15}$/)
        .withMessage('Please provide a valid phone number'),
    body('cgpa')
        .optional()
        .isFloat({ min: 0, max: 10 })
        .withMessage('CGPA must be between 0 and 10'),
    body('skills')
        .optional()
        .isArray({ max: 30 })
        .withMessage('Skills must be an array with at most 30 items'),
    body('skills.*')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Each skill must be between 1 and 50 characters'),
    body('linkedin_url')
        .optional()
        .trim()
        .isURL()
        .withMessage('Please provide a valid URL for LinkedIn'),
    body('github_url')
        .optional()
        .trim()
        .isURL()
        .withMessage('Please provide a valid URL for GitHub')
];
