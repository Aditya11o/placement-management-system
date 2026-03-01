const express = require('express');
const { getHealth, ping } = require('../controllers/healthController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: System health and metrics endpoints
 */

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     summary: Full system health & metrics dashboard
 *     tags: [Health]
 *     description: |
 *       Returns a comprehensive health report including:
 *       - **MongoDB** connection status and ping latency
 *       - **Redis** connection status, ping latency, and memory usage
 *       - **Node.js** heap used/total, RSS, and process uptime
 *       - **System** CPU load averages (1m/5m/15m), OS memory
 *       - **Socket.io** currently connected user count
 *     responses:
 *       200:
 *         description: System is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: HEALTHY
 *                 timestamp:
 *                   type: string
 *                 responseTimeMs:
 *                   type: string
 *                   example: "3.21"
 *                 services:
 *                   type: object
 *                   properties:
 *                     mongodb:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: UP
 *                         latencyMs:
 *                           type: number
 *                           example: 2
 *                     redis:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: UP
 *                         latencyMs:
 *                           type: number
 *                         memoryUsed:
 *                           type: string
 *                           example: "1.23M"
 *                 process:
 *                   type: object
 *                 system:
 *                   type: object
 *                 realtime:
 *                   type: object
 *                   properties:
 *                     connectedUsers:
 *                       type: number
 *       503:
 *         description: System is degraded (MongoDB down)
 */
router.get('/', getHealth);

/**
 * @swagger
 * /api/v1/health/ping:
 *   get:
 *     summary: Lightweight liveness probe
 *     tags: [Health]
 *     description: Ultra-fast endpoint for Docker health checks, uptime monitors (UptimeRobot, etc.)
 *     responses:
 *       200:
 *         description: Server is alive
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 timestamp:
 *                   type: string
 */
router.get('/ping', ping);

module.exports = router;
