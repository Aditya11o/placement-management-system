const express = require('express');
const { 
  getStudentResume, 
  getStudentDashboard,
  updateStudentProfile,
  changePassword,
  getNotificationSettings,
  updateNotificationSettings,
  getPrivacySettings,
  updatePrivacySettings,
  uploadStudentResume,
  deleteStudentResume,
  getStudentResumes,
  deactivateAccount,
  deleteAccount
} = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/resumeUploadMiddleware');
const router = express.Router();

router.get('/resume', protect, getStudentResumes); 
router.get('/resumes', protect, getStudentResumes); 
router.post('/upload-resume', protect, upload.single('resume'), uploadStudentResume);
router.delete('/resume/:id', protect, deleteStudentResume);

router.get('/dashboard', protect, getStudentDashboard);
router.put('/profile', protect, updateStudentProfile);
router.put('/change-password', protect, changePassword);

router.get('/notification-settings', protect, getNotificationSettings);
router.put('/notification-settings', protect, updateNotificationSettings);

router.get('/privacy-settings', protect, getPrivacySettings);
router.put('/privacy-settings', protect, updatePrivacySettings);

router.put('/deactivate', protect, deactivateAccount);
router.delete('/delete-account', protect, deleteAccount);

module.exports = router;
