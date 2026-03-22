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
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
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
