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
// router.use('/audit', require('../auditLogRoutes'));
router.use('/notifications', require('../notificationRoutes'));
router.use('/settings', require('../settingsRoutes'));
// router.use('/messages', require('../messageRoutes'));
router.use('/upload', require('../uploadRoutes'));
router.use('/students', require('../studentRoutes'));
// router.use('/alumni', require('../alumniRoutes'));
// router.use('/resources', require('../resourceRoutes'));
// router.use('/tickets', require('../ticketRoutes'));
// router.use('/faqs', require('../faqRoutes'));
// router.use('/mock-interviews', require('../mockInterviewRoutes'));
// router.use('/reminders', require('../reminderRoutes'));
router.use('/interviews', require('../interviewRoutes'));
// router.use('/experiences', require('../experienceRoutes'));
router.use('/drives', require('../driveRoutes'));
// router.use('/calendar', require('../academicEventRoutes'));

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
