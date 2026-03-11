const express = require('express');
const { getStudentProfile, updateStudentProfile, getStudents, inviteStudent } = require('../controllers/studentController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const advancedResults = require('../middlewares/advancedResults');
const Student = require('../models/Student');

const router = express.Router();

// All routes are protected
router.use(protect);

/**
 * @desc Get all students (Recruiters/Admins)
 */
router.get('/', authorize('RECRUITER', 'ADMIN'), advancedResults(Student), getStudents);

/**
 * @desc Invite student (Recruiters only)
 */
router.post('/:id/invite', authorize('RECRUITER'), inviteStudent);

/**
 * @desc Get logged-in student profile (Student only)
 */
router.get('/profile', authorize('STUDENT'), getStudentProfile);

/**
 * @desc Update student profile (Student only)
 */
router.put('/profile', authorize('STUDENT'), updateStudentProfile);

module.exports = router;
