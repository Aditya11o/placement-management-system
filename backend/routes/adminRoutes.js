const express = require('express');
const { 
  getStats, getUsers, verifyUser, sendBroadcast, 
  getInterviews, getPlacementReports, getRecentActivities,
  getPendingVerifications, verifySkill, getCompanyHistory, getAdvancedAnalytics
} = require('../controllers/adminController');
const { archiveYear, getArchives } = require('../controllers/archiveController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/activities', getRecentActivities);
router.get('/users', getUsers);
router.patch('/users/:id/verify', verifyUser);
// Notification broadcasts are handled in notificationRoutes.js
router.get('/interviews', getInterviews);
router.get('/reports/placements', getPlacementReports);
router.get('/analytics', getAdvancedAnalytics);
router.get('/verifications', getPendingVerifications);
router.patch('/verifications/:profileId/:verificationId', verifySkill);
router.get('/recruiters/:id/history', getCompanyHistory);

// Archive Routes
router.post('/archive', protect, authorize('admin'), archiveYear);
router.get('/archives', protect, authorize('admin'), getArchives);

module.exports = router;
