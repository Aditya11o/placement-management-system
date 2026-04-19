const express = require('express');
const router = express.Router();

// Register All Routes
router.use('/auth', require('../authRoutes'));
router.use('/profile', require('../profileRoutes'));
router.use('/admin', require('../adminRoutes'));
router.use('/admin/health', require('../systemHealthRoutes'));
router.use('/admin/data', require('../importExportRoutes'));
router.use('/companies', require('../companyRoutes'));
router.use('/jobs', require('../jobRoutes'));
router.use('/applications', require('../applicationRoutes'));
router.use('/notifications', require('../notificationRoutes'));
router.use('/settings', require('../settingsRoutes'));
router.use('/upload', require('../uploadRoutes'));
router.use('/students', require('../studentRoutes'));
router.use('/interviews', require('../interviewRoutes'));
router.use('/drives', require('../driveRoutes'));

// Health check (v1 specific if needed)
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    version: 'v1',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
