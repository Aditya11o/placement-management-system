const express = require('express');
const { registerUser, authUser, refreshAccessToken, verifyOTP, logoutUser } = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validateMiddleware');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, authUser);
router.post('/verify-otp', verifyOTP);
router.post('/refresh', refreshAccessToken);
router.post('/logout', protect, logoutUser);

module.exports = router;
