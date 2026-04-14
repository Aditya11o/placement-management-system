const express = require('express');
const { getStudentInterviews, exportInterviewsICS, getInterviewHistory } = require('../controllers/interviewController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(protect);

// Real Interview Routes (Existing)
router.get('/:studentId', getStudentInterviews);
router.get('/history/:studentId', getInterviewHistory);
router.get('/:studentId/export', exportInterviewsICS);

module.exports = router;
