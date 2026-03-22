const express = require('express');
const { registerUser, authUser, refreshAccessToken, verifyOTP } = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validateMiddleware');
const router = express.Router();

router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, authUser);
router.post('/verify-otp', verifyOTP);
router.post('/refresh', refreshAccessToken);

module.exports = router;
