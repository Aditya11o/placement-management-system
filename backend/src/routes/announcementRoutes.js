const express = require('express');
const { getAnnouncements, createAnnouncement, deleteAnnouncement } = require('../controllers/announcementController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { cache } = require('../middlewares/cacheMiddleware');
const { validate } = require('../middlewares/validate');
const { validateAnnouncementCreation } = require('../validations/announcementValidator');

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
router.post('/', authorize('ADMIN'), validateAnnouncementCreation, validate, createAnnouncement);

// Only admins can delete
/**
 * @swagger
 * /api/v1/announcements/{id}:
 *   delete:
 *     summary: Delete an announcement (Admin only)
 *     tags: [Announcements]
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
 *         description: Announcement deleted successfully
 */
router.delete('/:id', authorize('ADMIN'), deleteAnnouncement);

module.exports = router;
