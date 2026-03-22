const express = require('express');
const { getMyProfile, updateProfile, addResume, deleteResume, requestSkillVerification } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/me').get(protect, getMyProfile);
router.route('/').put(protect, updateProfile);
router.route('/resumes').post(protect, addResume);
router.route('/resumes/:id').delete(protect, deleteResume);
router.route('/verify-skill').post(protect, requestSkillVerification);

module.exports = router;
