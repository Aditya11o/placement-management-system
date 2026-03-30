const express = require('express');
const { getRecruiterSettings, updateRecruiterSettings } = require('../controllers/settingsController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/recruiter').get(protect, getRecruiterSettings).put(protect, updateRecruiterSettings);

module.exports = router;
