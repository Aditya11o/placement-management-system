const express = require('express');
const { getStudentInterviews, exportInterviewsICS, getInterviewHistory, selectInterviewSlot } = require('../controllers/interviewController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(protect);

// Real Interview Routes (Existing)
router.get('/:studentId', getStudentInterviews);
router.get('/history/:studentId', getInterviewHistory);
router.get('/:studentId/export', exportInterviewsICS);
router.patch('/:id/select-slot', selectInterviewSlot);

module.exports = router;
