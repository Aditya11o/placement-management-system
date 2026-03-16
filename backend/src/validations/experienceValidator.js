const { body } = require('express-validator');

exports.validateExperienceCreation = [
    body('company_name')
        .trim()
        .notEmpty()
        .withMessage('Company name is required')
        .isLength({ max: 200 })
        .withMessage('Company name cannot exceed 200 characters'),
    body('role')
        .trim()
        .notEmpty()
        .withMessage('Role/position is required'),
    body('experience_type')
        .optional()
        .isIn(['INTERVIEW', 'INTERNSHIP', 'PLACEMENT'])
        .withMessage('Invalid experience type'),
    body('difficulty')
        .optional()
        .isIn(['EASY', 'MEDIUM', 'HARD'])
        .withMessage('Difficulty must be EASY, MEDIUM, or HARD'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Experience description is required')
        .isLength({ max: 10000 })
        .withMessage('Description cannot exceed 10000 characters'),
    body('rating')
        .optional()
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5')
];
