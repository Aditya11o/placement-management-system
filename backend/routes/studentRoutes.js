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
  createBuiltResume,
  setPrimaryResume,
  deleteStudentResume,
  getStudentResumes,
  deactivateAccount,
  deleteAccount
} = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/resumeUploadMiddleware');
const { 
  validateChangePassword, 
  validateUpdateStudentProfile, 
  validateNotificationSettings, 
  validatePrivacySettings 
} = require('../middleware/validateMiddleware');
const router = express.Router();

router.get('/resume', protect, getStudentResumes); 
router.get('/resumes', protect, getStudentResumes); 
router.post('/upload-resume', protect, upload.single('resume'), uploadStudentResume);
router.post('/build-resume', protect, createBuiltResume);
router.patch('/resume/:id/primary', protect, setPrimaryResume);
router.delete('/resume/:id', protect, deleteStudentResume);

router.get('/dashboard', protect, getStudentDashboard);
router.put('/profile', protect, validateUpdateStudentProfile, updateStudentProfile);
router.put('/change-password', protect, validateChangePassword, changePassword);

router.get('/notification-settings', protect, getNotificationSettings);
router.put('/notification-settings', protect, validateNotificationSettings, updateNotificationSettings);

router.get('/privacy-settings', protect, getPrivacySettings);
router.put('/privacy-settings', protect, validatePrivacySettings, updatePrivacySettings);

router.put('/deactivate', protect, deactivateAccount);
router.delete('/delete-account', protect, deleteAccount);

module.exports = router;
