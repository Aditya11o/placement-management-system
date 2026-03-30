const express = require('express');
const { 
  registerUser, 
  authUser, 
  refreshAccessToken, 
  verifyOTP, 
  logoutUser,
  forgotPassword,
  resetPassword,
  updatePassword,
  deactivateAccount
} = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validateMiddleware');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, authUser);
router.post('/verify-otp', verifyOTP);
router.post('/refresh', refreshAccessToken);
router.post('/logout', protect, logoutUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.put('/update-password', protect, updatePassword);
router.delete('/deactivate', protect, deactivateAccount);

module.exports = router;
