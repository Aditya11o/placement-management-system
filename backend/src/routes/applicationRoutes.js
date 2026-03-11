const express = require('express');
const { applyToJob, getMyApplications, getJobApplicants, getRecruiterApplications, updateApplicationStatus, addScorecard, acceptOffer, declineOffer } = require('../controllers/applicationController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validate');
const { validateApplicationApply, validateApplicationStatusUpdate } = require('../validations/applicationValidator');
const advancedResults = require('../middlewares/advancedResults');
const Application = require('../models/Application');
const idempotency = require('../middlewares/idempotencyMiddleware');

const router = express.Router();

router.use(protect);

// Aliases for frontend compatibility
router.post('/', authorize('STUDENT'), idempotency, validateApplicationApply, validate, applyToJob);
router.get('/student', authorize('STUDENT'), getMyApplications);

/**
 * @swagger
 * /api/v1/applications/apply:
 *   post:
 *     summary: Apply to a job
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: X-Idempotency-Key
 *         schema:
 *           type: string
 *           format: uuid
 *         description: |
 *           Optional unique key (UUID v4 recommended) to prevent duplicate applications on retries.
 *           If the same key is sent again within 24h, the original response is replayed instantly
 *           without re-executing the request. Response will include `X-Idempotent-Replayed: true` header.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - job_id
 *             properties:
 *               job_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Application submitted successfully
 *       400:
 *         description: Not eligible or already applied
 */
router.post('/apply', authorize('STUDENT'), idempotency, validateApplicationApply, validate, applyToJob);

/**
 * @swagger
 * /api/v1/applications/my-applications:
 *   get:
 *     summary: Get student's applications
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of applications
 */
router.get('/my-applications', authorize('STUDENT'), getMyApplications);

// Recruiter routes
router.get('/recruiter', authorize('RECRUITER'), getRecruiterApplications);

/**
 * @swagger
 * /api/v1/applications/job/{job_id}:
 *   get:
 *     summary: Get applicants for a specific job
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: job_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of applicants
 *       404:
 *         description: Job not found or not owned by recruiter
 */
router.get('/job/:job_id', authorize('RECRUITER'), getJobApplicants);

/**
 * @swagger
 * /api/v1/applications/resumes:
 *   get:
 *     summary: Browse the global student resume bank
 *     description: Fetch all verified students. Recruiters can filter by skills via query params (e.g., ?skills[in]=React,Node)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of students with skills and resumes
 */
const Student = require('../models/Student');
router.get('/resumes', authorize('RECRUITER'), advancedResults(Student), (req, res) => {
    // Only return students who are fully approved
    // advancedResults payload handles the response wrapper natively
    const approvedStudents = res.advancedResults.data.filter(student => student.status === 'APPROVED');
    res.advancedResults.data = approvedStudents;
    res.advancedResults.count = approvedStudents.length;

    res.status(200).json(res.advancedResults);
});

/**
 * @swagger
 * /api/v1/applications/{id}/status:
 *   put:
 *     summary: Update an application status
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [SUBMITTED, REVIEWED, SHORTLISTED, SELECTED, REJECTED]
 *     responses:
 *       200:
 *         description: Status updated successfully
 */
router.put('/:id/status', authorize('RECRUITER'), idempotency, validateApplicationStatusUpdate, validate, updateApplicationStatus);

/**
 * @swagger
 * /api/v1/applications/{id}/scorecards:
 *   post:
 *     summary: Add an interview scorecard
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - communication
 *               - technical
 *               - culture
 *               - overall
 *             properties:
 *               communication:
 *                 type: number
 *               technical:
 *                 type: number
 *               culture:
 *                 type: number
 *               overall:
 *                 type: number
 *               comments:
 *                 type: string
 *     responses:
 *       201:
 *         description: Scorecard added successfully
 *       400:
 *         description: Invalid rating scale
 *       403:
 *         description: Not authorized
 */
router.post('/:id/scorecards', authorize('RECRUITER'), addScorecard);

// Offer Management (Student)
router.post('/:id/accept', authorize('STUDENT'), acceptOffer);
router.post('/:id/decline', authorize('STUDENT'), declineOffer);

module.exports = router;
