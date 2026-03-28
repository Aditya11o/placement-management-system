const { check, validationResult } = require('express-validator');
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
      // Block common passwords that pass the regex but are in every breach dictionary
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

      // Block passwords containing the user's name or email prefix
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
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Return the first error message for simplicity on the frontend
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    next();
  },
];

const validateLogin = [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    next();
  },
];

module.exports = { validateRegister, validateLogin };
