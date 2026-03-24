const express = require('express');
const { 
  getMyProfile, 
  updateProfile, 
  addResume, 
  deleteResume, 
  requestSkillVerification, 
  updateResume,
  addProject,
  uploadResume,
  updateProject,
  deleteProject,
  getStudentProfileById,
  getStudentSkillsById,
  getStudentProjectsById,
  getStudentAcademicById
} = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const resumeUpload = require('../middleware/resumeUploadMiddleware');
const router = express.Router();

router.route('/me').get(protect, getMyProfile);
router.route('/').put(protect, upload.single('avatar'), updateProfile);
router.route('/resumes').post(protect, addResume);
router.route('/resumes/:id').delete(protect, deleteResume);
router.route('/verify-skill').post(protect, requestSkillVerification);
router.route('/student/resume').post(protect, updateResume);

// New Routes
router.route('/projects').post(protect, addProject);
router.route('/projects/:projectId').put(protect, updateProject).delete(protect, deleteProject);
router.route('/upload-resume').post(protect, resumeUpload.single('resume'), uploadResume);

router.route('/student/profile/:id').get(protect, getStudentProfileById);
router.route('/student/skills/:id').get(protect, getStudentSkillsById);
router.route('/student/projects/:id').get(protect, getStudentProjectsById);
router.route('/student/academic/:id').get(protect, getStudentAcademicById);

module.exports = router;
