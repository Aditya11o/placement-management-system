const express = require('express');
const { getStudentProfile, updateStudentProfile } = require('../controllers/studentController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

// All routes here are protected and limited to students
router.use(protect);
router.use(authorize('STUDENT'));

/**
 * @swagger
 * /api/v1/students/profile:
 *   get:
 *     summary: Get logged-in student profile
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile data
 */
router.get('/profile', getStudentProfile);

/**
 * @swagger
 * /api/v1/students/profile:
 *   put:
 *     summary: Update student profile
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put('/profile', updateStudentProfile);

module.exports = router;
