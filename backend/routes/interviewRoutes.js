const express = require('express');
const { getStudentInterviews, exportInterviewsICS, getInterviewHistory } = require('../controllers/interviewController');
const { 
  bookMockInterview, 
  getUpcomingMockInterviews, 
  cancelMockInterview, 
  completeMockInterview 
} = require('../controllers/mockInterviewController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(protect);

// Mock Interview Specific Routes (Requested)
router.post('/book', authorize('student'), bookMockInterview);
router.get('/student', authorize('student'), getUpcomingMockInterviews);
router.put('/cancel', cancelMockInterview);
router.put('/complete', completeMockInterview);

// Real Interview Routes (Existing)
router.get('/:studentId', getStudentInterviews);
router.get('/history/:studentId', getInterviewHistory);
router.get('/:studentId/export', exportInterviewsICS);

module.exports = router;
