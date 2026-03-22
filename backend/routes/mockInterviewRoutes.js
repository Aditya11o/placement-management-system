const express = require('express');
const {
  bookMockInterview,
  getMockInterviewStats,
  getUpcomingMockInterviews,
  getMockInterviewHistory,
  getMockInterviewAnalytics
} = require('../controllers/mockInterviewController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/book', protect, authorize('student'), bookMockInterview);
router.get('/stats', protect, authorize('student'), getMockInterviewStats);
router.get('/upcoming', protect, authorize('student'), getUpcomingMockInterviews);
router.get('/history', protect, authorize('student'), getMockInterviewHistory);
router.get('/analytics', protect, authorize('student'), getMockInterviewAnalytics);

module.exports = router;
