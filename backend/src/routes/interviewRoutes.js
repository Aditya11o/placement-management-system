const express = require('express');
const {
    scheduleInterview,
    respondToInterview,
    updateInterviewStatus,
    rescheduleInterview,
    getMyInterviews,
    enterInterviewRoom,
    bookSlot,
    submitFeedback
} = require('../controllers/interviewController');
const {
    createSlots,
    getJobSlots,
    deleteSlot
} = require('../controllers/interviewSlotController');
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

/**
 * @swagger
 * /api/v1/interviews/{id}/reschedule:
 *   patch:
 *     summary: Reschedule an interview (Recruiter only)
 *     tags: [Interviews]
 */
router.route('/:id/reschedule').patch(authorize('RECRUITER'), rescheduleInterview);

/**
 * @swagger
 * /api/v1/interviews/{id}/join:
 *   get:
 *     summary: Join internal video interview room
 *     tags: [Interviews]
 */
router.route('/:id/join').get(enterInterviewRoom);

// --- New Scheduling & Feedback Flow ---

/**
 * @desc    Submit interview feedback (Recruiter only)
 */
router.route('/:id/feedback').post(authorize('RECRUITER'), submitFeedback);

/**
 * @desc    Availability Slots Management
 */
router.route('/slots').post(authorize('RECRUITER'), createSlots);
router.route('/slots/:jobId').get(getJobSlots);
router.route('/slots/:id').delete(authorize('RECRUITER'), deleteSlot);

/**
 * @desc    Book a slot (Student only)
 */
router.route('/slots/:id/book').post(authorize('STUDENT'), bookSlot);

module.exports = router;
