const { param, query } = require('express-validator');

/**
 * Reusable validators used across multiple route files.
 * Import and compose these in any route handler.
 */

/** Validates that :id is a valid MongoDB ObjectId */
exports.validateMongoId = [
    param('id')
        .isMongoId()
        .withMessage('Invalid resource ID format')
];

/** Validates common pagination query parameters */
exports.validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    query('sort')
        .optional()
        .isString()
        .trim()
        .withMessage('Sort must be a string field name')
];

/** Validates a search query string */
exports.validateSearchQuery = [
    query('q')
        .trim()
        .notEmpty()
        .withMessage('Search query is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Search query must be between 2 and 100 characters')
];
