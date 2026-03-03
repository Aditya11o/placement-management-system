const express = require('express');
const { createJob, getRecruiterJobs, updateJob, getEligibleJobs, getJobById, getRecommendedJobs } = require('../controllers/jobController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validate');
const { validateJobCreation, validateJobUpdate } = require('../validations/jobValidator');
const advancedResults = require('../middlewares/advancedResults');
const { cache } = require('../middlewares/cacheMiddleware');
const Job = require('../models/Job');

const router = express.Router();

router.use(protect);

// Shared / Common root routes
router.get('/', authorize('STUDENT'), cache(300), advancedResults(Job), getEligibleJobs);

// Recruiter routes
/**
 * @swagger
 * /api/v1/jobs:
 *   post:
 *     summary: Create a new job posting
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - package
 *               - role_type
 *               - eligible_branches
 *               - graduation_year
 *               - min_cgpa
 *               - deadline
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               package:
 *                 type: number
 *               role_type:
 *                 type: string
 *               eligible_branches:
 *                 type: array
 *                 items:
 *                   type: string
 *               graduation_year:
 *                 type: number
 *               min_cgpa:
 *                 type: number
 *               deadline:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Job created successfully
 */
router.post('/', authorize('RECRUITER'), validateJobCreation, validate, createJob);

/**
 * @swagger
 * /api/v1/jobs/recruiter:
 *   get:
 *     summary: Get jobs posted by the logged-in recruiter
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of recruiter jobs
 */
router.get('/recruiter', authorize('RECRUITER'), cache(300), advancedResults(Job), getRecruiterJobs);

/**
 * @swagger
 * /api/v1/jobs/{id}:
 *   put:
 *     summary: Update an existing job posting
 *     tags: [Jobs]
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
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *               deadline:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Job updated successfully
 */
router.put('/:id', authorize('RECRUITER'), validateJobUpdate, validate, updateJob);

// Student routes
/**
 * @swagger
 * /api/v1/jobs/eligible:
 *   get:
 *     summary: Get active jobs the logged-in student is eligible for
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of eligible jobs
 */
router.get('/eligible', authorize('STUDENT'), cache(300), advancedResults(Job), getEligibleJobs);

/**
 * @swagger
 * /api/v1/jobs/recommended:
 *   get:
 *     summary: Get top 5 recommended jobs based on AI matching score
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of top recommended jobs
 */
router.get('/recommended', authorize('STUDENT'), getRecommendedJobs);

// Shared
/**
 * @swagger
 * /api/v1/jobs/{id}:
 *   get:
 *     summary: Get job details by ID
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job details
 */
router.get('/:id', cache(300), getJobById);

module.exports = router;
