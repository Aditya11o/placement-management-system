const os = require('os');
const fs = require('fs');
const path = require('path');
const prisma = require('../utils/prisma');
const nodemailer = require('nodemailer');
const cloudinary = require('cloudinary').v2;

/**
 * @desc    Get detailed system health metrics
 * @route   GET /api/admin/health/system
 * @access  Private (Super Admin)
 */
const getSystemHealth = async (req, res, next) => {
  try {
    // 1. Process & OS Metrics
    const uptime = Math.floor(process.uptime());
    const memoryUsage = process.memoryUsage();
    const cpuLoad = os.loadavg();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();

    // 2. Connectivity Checks
    const connectivity = {
      database: 'Disconnected',
      smtp: 'Disconnected',
      cloudinary: 'Disconnected'
    };

    // DB Check
    try {
      await prisma.$queryRaw`SELECT 1`;
      connectivity.database = 'Connected';
    } catch (err) {
      connectivity.database = 'Error';
    }

    // SMTP Check
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      await transporter.verify();
      connectivity.smtp = 'Connected';
    } catch (err) {
      connectivity.smtp = 'Error';
    }

    // Cloudinary Check
    try {
      const ping = await cloudinary.api.ping();
      if (ping.status === 'ok') connectivity.cloudinary = 'Connected';
    } catch (err) {
      connectivity.cloudinary = 'Error';
    }

    // 3. Log Analytics (Latest 50 Access Logs + 24h Error Count)
    const logDir = path.join(__dirname, '../logs');
    const accessLogPath = path.join(logDir, 'access.log');
    const errorLogPath = path.join(logDir, 'error.log');

    let recentLogs = [];
    let dailyErrorCount = 0;

    // Parse latest 50 access logs
    if (fs.existsSync(accessLogPath)) {
      const data = fs.readFileSync(accessLogPath, 'utf8');
      const lines = data.trim().split('\n');
      recentLogs = lines.slice(-50).map(line => {
        try {
          return JSON.parse(line);
        } catch (e) {
          return { raw: line };
        }
      }).reverse();
    }

    // Parse errors in last 24 hours
    if (fs.existsSync(errorLogPath)) {
      const data = fs.readFileSync(errorLogPath, 'utf8');
      const lines = data.trim().split('\n');
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      lines.forEach(line => {
        try {
          const entry = JSON.parse(line);
          if (new Date(entry.timestamp) > oneDayAgo) {
            dailyErrorCount++;
          }
        } catch (e) {
          // ignore malformed lines
        }
      });
    }

    res.json({
      timestamp: new Date().toISOString(),
      system: {
        uptime,
        nodeVersion: process.version,
        platform: os.platform(),
        arch: os.arch(),
        cpuCount: os.cpus().length,
        loadAverage: cpuLoad,
        memory: {
          total: totalMem,
          free: freeMem,
          process: memoryUsage.rss
        }
      },
      connectivity,
      logs: {
        recent: recentLogs,
        dailyErrorCount
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSystemHealth
};
