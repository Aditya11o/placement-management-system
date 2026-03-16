const express = require('express');
const { getLogs, getLogById, getLogStats, getUserActivityFeed, getUserTimeline } = require('../controllers/logController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const checkPermission = require('../middlewares/checkPermission');

const router = express.Router();
router.use(protect);
router.use(authorize('ADMIN'));
router.use(checkPermission('view_logs'));

/**
 * @swagger
 * tags:
 *   name: Logs
 *   description: Admin audit log and activity feed
 */

/**
 * @swagger
 * /api/v1/logs:
 *   get:
 *     summary: Query the audit log with rich filtering
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       Returns a paginated activity feed from the `Log` collection.
 *       All filter params are optional and combinable.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 25
 *           maximum: 100
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *         description: Filter logs for a specific user (MongoDB ID)
 *       - in: query
 *         name: user_role
 *         schema:
 *           type: string
 *           enum: [STUDENT, RECRUITER, ADMIN]
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Partial-match on action name (e.g. "APPLY" matches "APPLY_JOB")
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *           example: "2026-01-01"
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *           example: "2026-03-01"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Full-text search across description and action fields
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: "-created_at"
 *         description: Sort field(s), prefix with `-` for descending
 *     responses:
 *       200:
 *         description: Paginated log entries with filter echo
 */
router.get('/', getLogs);

/**
 * @swagger
 * /api/v1/logs/stats:
 *   get:
 *     summary: Activity feed statistics (action breakdown, daily heatmap, top users)
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       Returns 4 aggregation series for dashboard visualisation:
 *       - **actionBreakdown**: top 20 action types by frequency
 *       - **roleBreakdown**: event count per user role
 *       - **dailyActivity**: events per day over the last 30 days (heatmap)
 *       - **topUsers**: top 10 most active users
 *
 *       Accepts `?from` and `?to` date range params.
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Aggregated stats object
 */
router.get('/stats', getLogStats);

/**
 * @swagger
 * /api/v1/logs/user/{userId}:
 *   get:
 *     summary: Get the full audit trail for a specific user
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Optional action filter
 *     responses:
 *       200:
 *         description: Paginated activity feed for the user, with enriched actor info
 */
router.get('/user/:userId', getUserActivityFeed);
router.get('/user/:userId/timeline', getUserTimeline);

/**
 * @swagger
 * /api/v1/logs/{id}:
 *   get:
 *     summary: Get a single log entry by ID (with actor identity resolved)
 *     tags: [Logs]
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
 *         description: Log entry with enriched actor field (name + email)
 *       404:
 *         description: Log entry not found
 */
router.get('/:id', getLogById);

module.exports = router;
