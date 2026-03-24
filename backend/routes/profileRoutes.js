const express = require('express');
const { getMyProfile, updateProfile, addResume, deleteResume, requestSkillVerification, updateResume } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const router = express.Router();

router.route('/me').get(protect, getMyProfile);
router.route('/').put(protect, upload.single('avatar'), updateProfile);
router.route('/resumes').post(protect, addResume);
router.route('/resumes/:id').delete(protect, deleteResume);
router.route('/verify-skill').post(protect, requestSkillVerification);
router.route('/student/resume').post(protect, updateResume);

module.exports = router;
