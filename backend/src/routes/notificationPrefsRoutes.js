const express = require('express');
const { getPrefs, updatePrefs, resetPrefs } = require('../controllers/notificationPrefsController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: NotificationPrefs
 *   description: Per-user notification preference settings
 */

/**
 * @swagger
 * /api/v1/notification-prefs:
 *   get:
 *     summary: Get your notification preferences
 *     tags: [NotificationPrefs]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       Returns your current notification preferences and the list of configurable
 *       events available for your role (Student / Recruiter / Admin).
 *       If no preferences have been set yet, defaults (all ON) are returned.
 *     responses:
 *       200:
 *         description: Current preferences and available events
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     preferences:
 *                       type: object
 *                     availableEvents:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           key:
 *                             type: string
 *                             example: application_status_update
 *                           label:
 *                             type: string
 *                             example: Application status updates
 *                           channels:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["push", "email"]
 *   put:
 *     summary: Update your notification preferences
 *     tags: [NotificationPrefs]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       Send a partial or full preferences map. Simple boolean toggles OR
 *       per-channel `{ push, email }` objects are accepted:
 *       ```json
 *       {
 *         "application_status_update": { "push": true, "email": false },
 *         "weekly_digest": false,
 *         "new_job_posted": true
 *       }
 *       ```
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *             example:
 *               application_status_update:
 *                 push: true
 *                 email: false
 *               weekly_digest: false
 *     responses:
 *       200:
 *         description: Preferences updated successfully
 *       400:
 *         description: No valid preference keys provided
 *   delete:
 *     summary: Reset all preferences to defaults (all notifications ON)
 *     tags: [NotificationPrefs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Preferences reset to defaults
 */
router.route('/')
    .get(getPrefs)
    .put(updatePrefs)
    .delete(resetPrefs);

module.exports = router;
