const express = require('express');
const { getStats, getUsers, verifyUser, sendBroadcast, getInterviews, getPlacementReports } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/stats', protect, authorize('admin'), getStats);
router.get('/users', protect, authorize('admin'), getUsers);
router.patch('/users/:id/verify', protect, authorize('admin'), verifyUser);
router.post('/broadcast', protect, authorize('admin'), sendBroadcast);
router.get('/interviews', protect, authorize('admin'), getInterviews);
router.get('/reports/placements', protect, authorize('admin'), getPlacementReports);

module.exports = router;
