const express = require('express');
const { generateDescription } = require('../controllers/aiController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

// All AI generation tools are restricted to authenticated RECRUITERS
router.use(protect);
router.use(authorize('RECRUITER'));

/**
 * @swagger
 * /api/v1/ai/generate-job-description:
 *   post:
 *     summary: Generate a professional job description using AI
 *     tags: [AI]
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
 *             properties:
 *               title:
 *                 type: string
 *                 description: The job title (e.g., "Senior Software Engineer")
 *     responses:
 *       200:
 *         description: Successfully generated markdown job description
 *       400:
 *         description: Missing or invalid job title
 *       503:
 *         description: AI Service is unconfigured or unavailable
 */
router.post('/generate-job-description', generateDescription);

module.exports = router;
