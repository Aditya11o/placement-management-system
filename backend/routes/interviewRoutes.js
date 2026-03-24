const express = require('express');
const { getStudentInterviews, exportInterviewsICS, getInterviewHistory } = require('../controllers/interviewController');
// ...
router.get('/:studentId', getStudentInterviews);
router.get('/history/:studentId', getInterviewHistory);
router.get('/:studentId/export', exportInterviewsICS);

module.exports = router;
