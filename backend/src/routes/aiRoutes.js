const express = require('express');
const { 
    generateDescription, 
    generateMockInterview, 
    analyzeResume,
    getNextActions,
    getSkillSuggestions,
    summarizeExperience,
    analyzeInterviewResponse,
    autoTuneResume
} = require('../controllers/aiController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * /api/v1/ai/generate-job-description:
 *   post:
 *     summary: Generate a professional job description using AI
 */
router.post('/generate-job-description', authorize('RECRUITER'), generateDescription);

/**
 * @swagger
 * /api/v1/ai/generate-mock-interview:
 *   post:
 *     summary: Generate mock interview questions for students
 */
router.post('/generate-mock-interview', authorize('STUDENT'), generateMockInterview);

/**
 * @swagger
 * /api/v1/ai/analyze-resume:
 *   post:
 *     summary: Analyze a student's resume against a job description
 */
router.post('/analyze-resume', authorize('STUDENT'), analyzeResume);

/**
 * @swagger
 * /api/v1/ai/next-actions:
 *   get:
 *     summary: Get personalized next best actions for student dashboard
 */
router.get('/next-actions', authorize('STUDENT'), getNextActions);

/**
 * @swagger
 * /api/v1/ai/skill-suggestions:
 *   get:
 *     summary: Get trending skill suggestions for student branch
 */
router.get('/skill-suggestions', authorize('STUDENT'), getSkillSuggestions);

/**
 * @swagger
 * /api/v1/ai/summarize-experience:
 *   post:
 *     summary: Generate a bulleted summary of an interview experience
 */
router.post('/summarize-experience', authorize('STUDENT'), summarizeExperience);

/**
 * @swagger
 * /api/v1/ai/analyze-response:
 *   post:
 *     summary: Analyze an interview response for feedback
 */
router.post('/analyze-response', authorize('STUDENT'), analyzeInterviewResponse);

/**
 * @swagger
 * /api/v1/ai/auto-tune-resume:
 *   post:
 *     summary: Auto-tune a student's resume for a job
 */
router.post('/auto-tune-resume', authorize('STUDENT'), autoTuneResume);

module.exports = router;
