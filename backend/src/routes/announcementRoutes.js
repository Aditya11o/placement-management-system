const express = require('express');
const { getAnnouncements, createAnnouncement } = require('../controllers/announcementController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { cache } = require('../middlewares/cacheMiddleware');

const router = express.Router();

router.use(protect);

// Any authenticated user can view announcements
/**
 * @swagger
 * /api/v1/announcements:
 *   get:
 *     summary: Get all announcements
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of announcements
 */
router.get('/', cache(300), getAnnouncements);

// Only admins can post
/**
 * @swagger
 * /api/v1/announcements:
 *   post:
 *     summary: Create a new announcement (Admin only)
 *     tags: [Announcements]
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
 *               - message
 *             properties:
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Announcement created successfully
 */
router.post('/', authorize('ADMIN'), createAnnouncement);

module.exports = router;
