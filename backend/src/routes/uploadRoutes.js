const express = require('express');
const {
    uploadResume, uploadLogo,
    getResumeHistory, activateResumeVersion, deleteResumeVersion
} = require('../controllers/uploadController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const { check } = require('express-validator');
const { validate } = require('../middlewares/validate');

const router = express.Router();
router.use(protect);

// Alias for frontend compatibility
router.get('/resumes', authorize('STUDENT'), getResumeHistory);

/**
 * @swagger
 * /api/v1/upload/resume:
 *   post:
 *     summary: Upload a new resume version (PDF only)
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       Uploads a new resume PDF to Cloudinary, runs AI skill extraction in parallel,
 *       and saves it as the new **active** version. Previous versions are deactivated but retained.
 *       The upload history is capped at **10 versions** (oldest is pruned automatically).
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               resume:
 *                 type: string
 *                 format: binary
 *               label:
 *                 type: string
 *                 description: Optional human-readable label (e.g. "Final version for internships")
 *     responses:
 *       201:
 *         description: Resume version uploaded and set as active
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     version:
 *                       type: integer
 *                       example: 3
 *                     label:
 *                       type: string
 *                       example: "v3"
 *                     url:
 *                       type: string
 *                     skills:
 *                       type: array
 *                       items:
 *                         type: string
 *                     totalVersions:
 *                       type: integer
 */
router.post('/resume', authorize('STUDENT'), upload.single('resume'), uploadResume);

/**
 * @swagger
 * /api/v1/upload/resume/history:
 *   get:
 *     summary: Get full resume version history (student)
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       Returns all stored resume versions sorted newest-first.
 *       The active version is marked with is_active: true.
 *     responses:
 *       200:
 *         description: List of resume versions
 */
router.get('/resume/history', authorize('STUDENT'), getResumeHistory);

/**
 * @swagger
 * /api/v1/upload/resume/history/{versionId}/activate:
 *   put:
 *     summary: Set a previous resume version as active
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       Activates the specified version and deactivates all others.
 *       This changes which resume URL recruiters see via `student.resume_url`.
 *       The top-level `skills` field is also updated to match the activated version.
 *     parameters:
 *       - in: path
 *         name: versionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Mongoose sub-document `_id` of the version to activate
 *     responses:
 *       200:
 *         description: Version activated
 *       404:
 *         description: Version not found
 */
router.put('/resume/history/:versionId/activate', authorize('STUDENT'), check('versionId', 'Valid version ID is required').isMongoId(), validate, activateResumeVersion);

/**
 * @swagger
 * /api/v1/upload/resume/history/{versionId}:
 *   delete:
 *     summary: Delete a non-active resume version from history
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     description: Removes a specific version from the history. The currently active version cannot be deleted — activate another version first.
 *     parameters:
 *       - in: path
 *         name: versionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Version deleted
 *       400:
 *         description: Cannot delete the currently active version
 */
router.delete('/resume/history/:versionId', authorize('STUDENT'), check('versionId', 'Valid version ID is required').isMongoId(), validate, deleteResumeVersion);

/**
 * @swagger
 * /api/v1/upload/logo:
 *   post:
 *     summary: Upload recruiter company logo (images only)
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               logo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Logo uploaded successfully
 */
router.post('/logo', authorize('RECRUITER'), upload.single('logo'), uploadLogo);

module.exports = router;
