const { check } = require('express-validator');

exports.validateJobCreation = [
    check('title', 'Job title is required').not().isEmpty().trim().escape(),
    check('description', 'Description is required').not().isEmpty().trim().escape(),
    check('min_cgpa', 'Minimum CGPA is required and must be between 0 and 10').isFloat({ min: 0, max: 10 }),
    check('eligible_branch', 'Eligible branch is required').not().isEmpty().trim().escape(),
    check('graduation_year', 'Graduation year is required').isInt({ min: 2000, max: 2100 }),
    check('max_backlogs_allowed', 'Max backlogs allowed must be a valid number').optional().isInt({ min: 0 }),
    check('min_marks_10th', 'Min 10th marks must be between 0 and 100').optional().isFloat({ min: 0, max: 100 }),
    check('min_marks_12th', 'Min 12th marks must be between 0 and 100').optional().isFloat({ min: 0, max: 100 }),
    check('diversity_hiring', 'Diversity hiring must be ALL or FEMALE_ONLY').optional().isIn(['ALL', 'FEMALE_ONLY']),
    check('deadline', 'Deadline is required and must be a valid date').isISO8601().toDate(),
    check('salary_min', 'Minimum salary must be a number').optional().isFloat({ min: 0 }),
    check('salary_max', 'Maximum salary must be a number').optional().isFloat({ min: 0 }),
    check('has_equity', 'Has equity must be a boolean').optional().isBoolean(),
    check('has_bonus', 'Has bonus must be a boolean').optional().isBoolean()
];

exports.validateJobUpdate = [
    check('title', 'Job title must be a string').optional().isString().trim().escape(),
    check('description', 'Description must be a string').optional().isString().trim().escape(),
    check('min_cgpa', 'Minimum CGPA must be between 0 and 10').optional().isFloat({ min: 0, max: 10 }),
    check('eligible_branch', 'Eligible branch must be a string').optional().isString().trim().escape(),
    check('graduation_year', 'Graduation year must be a valid year').optional().isInt({ min: 2000, max: 2100 }),
    check('max_backlogs_allowed', 'Max backlogs allowed must be a valid number').optional().isInt({ min: 0 }),
    check('min_marks_10th', 'Min 10th marks must be between 0 and 100').optional().isFloat({ min: 0, max: 100 }),
    check('min_marks_12th', 'Min 12th marks must be between 0 and 100').optional().isFloat({ min: 0, max: 100 }),
    check('diversity_hiring', 'Diversity hiring must be ALL or FEMALE_ONLY').optional().isIn(['ALL', 'FEMALE_ONLY']),
    check('deadline', 'Deadline must be a valid date').optional().isISO8601().toDate(),
    check('salary_min', 'Minimum salary must be a number').optional().isFloat({ min: 0 }),
    check('salary_max', 'Maximum salary must be a number').optional().isFloat({ min: 0 }),
    check('has_equity', 'Has equity must be a boolean').optional().isBoolean(),
    check('has_bonus', 'Has bonus must be a boolean').optional().isBoolean(),
    check('status', 'Status must be ACTIVE or CLOSED').optional().isIn(['ACTIVE', 'CLOSED'])
];
