const express = require('express');
const { getMyProfile, updateProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/me').get(protect, getMyProfile);
router.route('/').put(protect, updateProfile);

module.exports = router;
