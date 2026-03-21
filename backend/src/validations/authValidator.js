const { check } = require('express-validator');

exports.validateStudentRegister = [
    check('name', 'Name is required').not().isEmpty().trim().escape(),
    check('email', 'Only university emails (@tnu.in) are allowed for students').isEmail().matches(/@tnu\.in$/).normalizeEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    check('branch', 'Branch is required').optional().not().isEmpty().trim().escape(),
    check('cgpa', 'CGPA must be a number between 0 and 10').optional().isFloat({ min: 0, max: 10 }),
    check('graduation_year', 'Graduation year must be a valid year format (e.g. 2026)').optional().isInt({ min: 2000, max: 2100 }),
    check('phone', 'Please enter a valid phone number').optional().isMobilePhone(),
    check('backlogs_active', 'Active backlogs must be a valid number').optional().isInt({ min: 0 }),
    check('marks_10th', '10th grade marks must be between 0-100').optional().isFloat({ min: 0, max: 100 }),
    check('marks_12th', '12th grade marks must be between 0-100').optional().isFloat({ min: 0, max: 100 }),
    check('gender', 'Gender must be MALE, FEMALE, or OTHER').optional().isIn(['MALE', 'FEMALE', 'OTHER'])
];

exports.validateRecruiterRegister = [
    check('company_name', 'Company Name is required').optional().not().isEmpty().trim().escape(),
    check('contact_person', 'Contact Person is required').not().isEmpty().trim().escape(),
    check('email').isEmail().withMessage('Please include a valid email').custom(value => {
        const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'protonmail.com', 'zoho.com'];
        const domain = value.split('@')[1];
        if (personalDomains.includes(domain)) {
            throw new Error('Please use a company/business email. Personal domains are not allowed.');
        }
        return true;
    }).normalizeEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    check('phone', 'Please enter a valid phone number').optional().isMobilePhone()
];

exports.validateAdminRegister = [
    check('name', 'Name is required').not().isEmpty().trim().escape(),
    check('email', 'Only university emails (@tnu.in) are allowed for admins').isEmail().matches(/@tnu\.in$/).normalizeEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
];

exports.validateLogin = [
    check('email', 'Please include a valid email').isEmail().normalizeEmail(),
    check('password', 'Password is required').exists(),
    check('role', 'Role is required and must be STUDENT, RECRUITER, or ADMIN').isIn(['STUDENT', 'RECRUITER', 'ADMIN'])
];
