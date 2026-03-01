const { check } = require('express-validator');

exports.validateStudentRegister = [
    check('name', 'Name is required').not().isEmpty().trim().escape(),
    check('email', 'Please include a valid email').isEmail().normalizeEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    check('branch', 'Branch is required').not().isEmpty().trim().escape(),
    check('cgpa', 'CGPA is required and must be a number between 0 and 10').isFloat({ min: 0, max: 10 }),
    check('graduation_year', 'Graduation year is required and must be a valid year format (e.g. 2026)').isInt({ min: 2000, max: 2100 }),
    check('phone', 'Please enter a valid phone number').isMobilePhone(),
    check('backlogs_active', 'Active backlogs must be a valid number').optional().isInt({ min: 0 }),
    check('marks_10th', '10th grade marks are required (0-100 percentage or CGPA)').isFloat({ min: 0, max: 100 }),
    check('marks_12th', '12th grade marks are required (0-100 percentage or CGPA)').isFloat({ min: 0, max: 100 }),
    check('gender', 'Gender is required and must be MALE, FEMALE, or OTHER').isIn(['MALE', 'FEMALE', 'OTHER'])
];

exports.validateRecruiterRegister = [
    check('company_name', 'Company Name is required').not().isEmpty().trim().escape(),
    check('contact_person', 'Contact Person is required').not().isEmpty().trim().escape(),
    check('email', 'Please include a valid business email').isEmail().normalizeEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    check('phone', 'Please enter a valid phone number').isMobilePhone()
];

exports.validateLogin = [
    check('email', 'Please include a valid email').isEmail().normalizeEmail(),
    check('password', 'Password is required').exists(),
    check('role', 'Role is required and must be STUDENT, RECRUITER, or ADMIN').isIn(['STUDENT', 'RECRUITER', 'ADMIN'])
];
