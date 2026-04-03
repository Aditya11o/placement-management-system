const { check, param, validationResult } = require('express-validator');

// ========================================
// Shared error handler for all validators
// ========================================
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};

// ========================================
// JOB VALIDATORS
// ========================================

const validateCreateJob = [
  check('title')
    .trim()
    .notEmpty().withMessage('Job title is required')
    .isLength({ min: 3, max: 150 }).withMessage('Job title must be between 3 and 150 characters'),
  check('description')
    .trim()
    .notEmpty().withMessage('Job description is required')
    .isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),
  check('companyName')
    .trim()
    .notEmpty().withMessage('Company name is required'),
  check('jobType')
    .optional()
    .isIn(['Full-time', 'Part-time', 'Internship', 'Contract']).withMessage('Invalid job type'),
  check('salary')
    .optional()
    .isNumeric().withMessage('Salary must be a number')
    .custom((value) => {
      if (value < 0) throw new Error('Salary cannot be negative');
      return true;
    }),
  check('deadline')
    .optional()
    .isISO8601().withMessage('Deadline must be a valid date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Deadline must be a future date');
      }
      return true;
    }),
  check('location')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Location must be under 200 characters'),
  check('skills')
    .optional()
    .isArray().withMessage('Skills must be an array'),
  check('skills.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 }).withMessage('Each skill must be between 1 and 50 characters'),
  check('eligibility.minCGPA')
    .optional()
    .isFloat({ min: 0, max: 10 }).withMessage('Minimum CGPA must be between 0 and 10'),
  check('eligibility.branches')
    .optional()
    .isArray().withMessage('Branches must be an array'),
  check('openings')
    .optional()
    .isInt({ min: 1 }).withMessage('Openings must be at least 1'),
  handleValidationErrors,
];

const validateUpdateJob = [
  param('id').isMongoId().withMessage('Invalid job ID'),
  check('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 150 }).withMessage('Job title must be between 3 and 150 characters'),
  check('description')
    .optional()
    .trim()
    .isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),
  check('salary')
    .optional()
    .isNumeric().withMessage('Salary must be a number')
    .custom((value) => {
      if (value < 0) throw new Error('Salary cannot be negative');
      return true;
    }),
  check('deadline')
    .optional()
    .isISO8601().withMessage('Deadline must be a valid date'),
  handleValidationErrors,
];

const validateUpdateJobStatus = [
  param('id').isMongoId().withMessage('Invalid job ID'),
  check('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['open', 'closed', 'paused', 'draft']).withMessage('Invalid job status'),
  handleValidationErrors,
];

// ========================================
// APPLICATION VALIDATORS
// ========================================

const validateApplyForJob = [
  param('jobId').isMongoId().withMessage('Invalid job ID'),
  handleValidationErrors,
];

const validateUpdateApplicationStatus = [
  param('id').isMongoId().withMessage('Invalid application ID'),
  check('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected', 'Withdrawn', 'On Hold'])
    .withMessage('Invalid application status'),
  check('interviewDate')
    .optional()
    .isISO8601().withMessage('Interview date must be a valid date'),
  check('interviewLocation')
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('Interview location must be under 300 characters'),
  handleValidationErrors,
];

const validateBulkUpdateStatus = [
  check('applicationIds')
    .isArray({ min: 1 }).withMessage('At least one application ID is required'),
  check('applicationIds.*')
    .isMongoId().withMessage('Each application ID must be a valid ID'),
  check('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected', 'Withdrawn', 'On Hold'])
    .withMessage('Invalid application status'),
  handleValidationErrors,
];

const validateRespondToOffer = [
  param('id').isMongoId().withMessage('Invalid application ID'),
  check('response')
    .notEmpty().withMessage('Response is required')
    .isIn(['Accepted', 'Rejected']).withMessage('Response must be "Accepted" or "Rejected"'),
  handleValidationErrors,
];

// ========================================
// PROFILE VALIDATORS
// ========================================

const validateUpdateProfile = [
  check('studentDetails.current_cgpa')
    .optional()
    .isFloat({ min: 0, max: 10 }).withMessage('CGPA must be between 0 and 10'),
  check('studentDetails.tenth_percentage')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('10th percentage must be between 0 and 100'),
  check('studentDetails.twelfth_percentage')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('12th percentage must be between 0 and 100'),
  check('studentDetails.passing_year')
    .optional()
    .isInt({ min: 2000, max: 2040 }).withMessage('Passing year must be between 2000 and 2040'),
  check('studentDetails.phone')
    .optional()
    .trim()
    .matches(/^[0-9+\-\s()]{7,15}$/).withMessage('Please provide a valid phone number'),
  check('studentDetails.linkedin')
    .optional()
    .trim()
    .custom((value) => {
      if (value && !value.includes('linkedin.com')) {
        throw new Error('Please provide a valid LinkedIn URL');
      }
      return true;
    }),
  check('studentDetails.github')
    .optional()
    .trim()
    .custom((value) => {
      if (value && !value.includes('github.com')) {
        throw new Error('Please provide a valid GitHub URL');
      }
      return true;
    }),
  handleValidationErrors,
];

const validateAddProject = [
  check('title')
    .trim()
    .notEmpty().withMessage('Project title is required')
    .isLength({ min: 2, max: 150 }).withMessage('Project title must be 2-150 characters'),
  check('description')
    .trim()
    .notEmpty().withMessage('Project description is required')
    .isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  check('technologies')
    .optional()
    .isArray().withMessage('Technologies must be an array'),
  check('technologies.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 }).withMessage('Each technology name must be 1-50 characters'),
  check('link')
    .optional()
    .trim()
    .isURL().withMessage('Project link must be a valid URL'),
  handleValidationErrors,
];

const validateRequestSkillVerification = [
  check('skill')
    .trim()
    .notEmpty().withMessage('Skill name is required')
    .isLength({ min: 1, max: 50 }).withMessage('Skill name must be 1-50 characters'),
  check('certificateUrl')
    .trim()
    .notEmpty().withMessage('Certificate URL is required')
    .isURL().withMessage('Certificate URL must be a valid URL'),
  handleValidationErrors,
];

// ========================================
// STUDENT SETTINGS VALIDATORS
// ========================================

const validateChangePassword = [
  check('current_password')
    .notEmpty().withMessage('Current password is required'),
  check('new_password')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .withMessage('Password must contain uppercase, lowercase, number, and special character'),
  handleValidationErrors,
];

const validateUpdateStudentProfile = [
  check('full_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  check('phone')
    .optional()
    .trim()
    .matches(/^[0-9+\-\s()]{7,15}$/).withMessage('Please provide a valid phone number'),
  handleValidationErrors,
];

const validateNotificationSettings = [
  check('jobs').optional().isBoolean().withMessage('Jobs must be a boolean'),
  check('apps').optional().isBoolean().withMessage('Apps must be a boolean'),
  check('interviews').optional().isBoolean().withMessage('Interviews must be a boolean'),
  check('email').optional().isBoolean().withMessage('Email must be a boolean'),
  check('sms').optional().isBoolean().withMessage('SMS must be a boolean'),
  handleValidationErrors,
];

const validatePrivacySettings = [
  check('visible').optional().isBoolean().withMessage('Visible must be a boolean'),
  check('showPhone').optional().isBoolean().withMessage('showPhone must be a boolean'),
  check('showEmail').optional().isBoolean().withMessage('showEmail must be a boolean'),
  handleValidationErrors,
];

// ========================================
// AUTH ADDITIONAL VALIDATORS
// ========================================

const validateForgotPassword = [
  check('email')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  handleValidationErrors,
];

const validateResetPassword = [
  check('token')
    .notEmpty().withMessage('Reset token is required'),
  check('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .withMessage('Password must contain uppercase, lowercase, number, and special character'),
  handleValidationErrors,
];

const validateVerifyOTP = [
  check('email')
    .isEmail().withMessage('Please provide a valid email'),
  check('otp')
    .notEmpty().withMessage('OTP is required')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits')
    .isNumeric().withMessage('OTP must contain only numbers'),
  handleValidationErrors,
];

// ========================================
// MONGO ID PARAM VALIDATOR (Reusable)
// ========================================

const validateMongoId = [
  param('id').isMongoId().withMessage('Invalid ID format'),
  handleValidationErrors,
];

// ========================================
// AUTH: REGISTER & LOGIN (Original)
// ========================================

const { validateEmailDomain } = require('../utils/domainValidator');

const validateRegister = [
  check('name', 'Name is required').not().isEmpty(),
  check('email')
    .isEmail().withMessage('Please include a valid email')
    .custom((value, { req }) => {
      const { role } = req.body;
      const { isValid, message } = validateEmailDomain(value, role);
      if (!isValid) {
        throw new Error(message);
      }
      return true;
    }),
  check('password', 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .custom((value, { req }) => {
      const commonPasswords = [
        'Password1!', 'Password@1', 'Password1@', 'Password@123',
        'Admin@123', 'Admin@1234', 'Welcome@1', 'Welcome@123',
        'Qwerty@123', 'Abcd@1234', 'Test@1234', 'User@1234',
        'Change@123', 'Letmein@1', 'Iloveyou@1', 'Monkey@123',
        'Dragon@123', 'Master@123', 'Login@123', 'Hello@123',
        'Passw0rd!', 'P@ssword1', 'P@ssw0rd!', 'Pa$$w0rd1',
      ];
      if (commonPasswords.some(p => p.toLowerCase() === value.toLowerCase())) {
        throw new Error('This password is too common. Please choose a stronger password.');
      }
      const { name, email } = req.body;
      const lowerPassword = value.toLowerCase();
      if (name && name.length >= 3 && lowerPassword.includes(name.toLowerCase())) {
        throw new Error('Password must not contain your name.');
      }
      if (email) {
        const emailPrefix = email.split('@')[0].toLowerCase();
        if (emailPrefix.length >= 3 && lowerPassword.includes(emailPrefix)) {
          throw new Error('Password must not contain your email address.');
        }
      }
      return true;
    }),
  check('role', 'Role must be student, recruiter, or admin').isIn(['student', 'recruiter', 'admin']),
  handleValidationErrors,
];

const validateLogin = [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists(),
  handleValidationErrors,
];

module.exports = {
  // Auth (original)
  validateRegister,
  validateLogin,
  // Job
  validateCreateJob,
  validateUpdateJob,
  validateUpdateJobStatus,
  // Application
  validateApplyForJob,
  validateUpdateApplicationStatus,
  validateBulkUpdateStatus,
  validateRespondToOffer,
  // Profile
  validateUpdateProfile,
  validateAddProject,
  validateRequestSkillVerification,
  // Student Settings
  validateChangePassword,
  validateUpdateStudentProfile,
  validateNotificationSettings,
  validatePrivacySettings,
  // Auth (new)
  validateForgotPassword,
  validateResetPassword,
  validateVerifyOTP,
  // Generic
  validateMongoId,
};
