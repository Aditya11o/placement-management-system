const express = require('express');
const {
    scheduleInterview,
    respondToInterview,
    updateInterviewStatus,
    getMyInterviews
} = require('../controllers/interviewController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validate');
const { validateInterviewScheduling, validateInterviewResponse, validateInterviewStatusUpdate } = require('../validations/interviewValidator');

const router = express.Router();

router.use(protect); // All interview routes require login

/**
 * @swagger
 * /api/v1/interviews:
 *   get:
 *     summary: Get all interviews for logged-in user
 *     tags: [Interviews]
 *     parameters:
 *       - in: query
 *         name: upcoming
 *         schema:
 *           type: boolean
 *         description: Pass true to get only upcoming future interviews
 */
router.route('/').get(getMyInterviews);

/**
 * @swagger
 * /api/v1/interviews:
 *   post:
 *     summary: Schedule a new interview (Recruiter only)
 *     tags: [Interviews]
 */
router.route('/').post(authorize('RECRUITER'), validateInterviewScheduling, validate, scheduleInterview);

/**
 * @swagger
 * /api/v1/interviews/{id}/respond:
 *   put:
 *     summary: Student responds CONFIRMED or REJECTED
 *     tags: [Interviews]
 */
router.route('/:id/respond').put(authorize('STUDENT'), validateInterviewResponse, validate, respondToInterview);

/**
 * @swagger
 * /api/v1/interviews/{id}/status:
 *   put:
 *     summary: Recruiter updates status to COMPLETED or CANCELED
 *     tags: [Interviews]
 */
router.route('/:id/status').put(authorize('RECRUITER'), validateInterviewStatusUpdate, validate, updateInterviewStatus);

module.exports = router;
