const mongoose = require('mongoose');
const os = require('os');
const { getRedisClient } = require('../config/redis');
const { getConnectedCount } = require('../utils/socketManager');

/**
 * @desc    System Health & Metrics Dashboard
 * @route   GET /api/v1/health
 * @access  Public (for uptime monitors) — sensitive metrics gated to Admin via token
 */
exports.getHealth = async (req, res) => {
    const startTime = process.hrtime.bigint();

    // ── MongoDB Health ─────────────────────────────────────────────────────────
    let mongoStatus = 'DOWN';
    let mongoLatencyMs = null;
    try {
        const mongoStart = Date.now();
        // readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.db.admin().ping();
            mongoLatencyMs = Date.now() - mongoStart;
            mongoStatus = 'UP';
        }
    } catch {
        mongoStatus = 'DOWN';
    }

    // ── Redis Health ───────────────────────────────────────────────────────────
    let redisStatus = 'DOWN';
    let redisLatencyMs = null;
    let redisMemoryUsage = null;
    try {
        const client = getRedisClient();
        if (client && client.isOpen) {
            const redisStart = Date.now();
            await client.ping();
            redisLatencyMs = Date.now() - redisStart;

            // Pull INFO stats from Redis for memory usage
            const info = await client.info('memory');
            const match = info.match(/used_memory_human:(\S+)/);
            redisMemoryUsage = match ? match[1] : null;

            redisStatus = 'UP';
        }
    } catch {
        redisStatus = 'DOWN';
    }

    // ── Node.js Process Metrics ────────────────────────────────────────────────
    const memUsage = process.memoryUsage();
    const toMB = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

    const nodeMetrics = {
        heapUsed: toMB(memUsage.heapUsed),
        heapTotal: toMB(memUsage.heapTotal),
        heapUsagePercent: `${((memUsage.heapUsed / memUsage.heapTotal) * 100).toFixed(1)}%`,
        rss: toMB(memUsage.rss),           // resident set size (total memory allocated)
        external: toMB(memUsage.external), // C++ objects bound to JS objects
        uptimeSeconds: Math.floor(process.uptime()),
        uptimeFormatted: formatUptime(process.uptime()),
        nodeVersion: process.version,
        pid: process.pid
    };

    // ── System / Host OS Metrics ───────────────────────────────────────────────
    const cpuLoad = os.loadavg(); // [1m, 5m, 15m] averages
    const totalMemGB = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
    const freeMemGB = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
    const usedMemGB = (totalMemGB - freeMemGB).toFixed(2);

    const systemMetrics = {
        platform: os.platform(),
        arch: os.arch(),
        hostname: os.hostname(),
        cpuCores: os.cpus().length,
        cpuModel: os.cpus()[0]?.model || 'Unknown',
        cpuLoadAvg: {
            '1m': cpuLoad[0].toFixed(2),
            '5m': cpuLoad[1].toFixed(2),
            '15m': cpuLoad[2].toFixed(2)
        },
        memory: {
            total: `${totalMemGB} GB`,
            used: `${usedMemGB} GB`,
            free: `${freeMemGB} GB`,
            usagePercent: `${(((totalMemGB - freeMemGB) / totalMemGB) * 100).toFixed(1)}%`
        }
    };

    // ── Socket.io Metrics ──────────────────────────────────────────────────────
    const socketMetrics = {
        connectedUsers: getConnectedCount()
    };

    // ── Response Time ──────────────────────────────────────────────────────────
    const responseTimeMs = Number(process.hrtime.bigint() - startTime) / 1_000_000;

    // ── Overall System Status ──────────────────────────────────────────────────
    const isHealthy = mongoStatus === 'UP';  // Redis is optional — system can run without it
    const overallStatus = isHealthy ? 'HEALTHY' : 'DEGRADED';

    const httpStatus = isHealthy ? 200 : 503;

    return res.status(httpStatus).json({
        status: overallStatus,
        timestamp: new Date().toISOString(),
        responseTimeMs: responseTimeMs.toFixed(2),
        services: {
            mongodb: {
                status: mongoStatus,
                latencyMs: mongoLatencyMs
            },
            redis: {
                status: redisStatus,
                latencyMs: redisLatencyMs,
                memoryUsed: redisMemoryUsage
            }
        },
        process: nodeMetrics,
        system: systemMetrics,
        realtime: socketMetrics
    });
};

/**
 * @desc    Lightweight liveness probe — for Docker/k8s or uptime bots
 * @route   GET /api/v1/health/ping
 * @access  Public
 */
exports.ping = (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatUptime(seconds) {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
}
