const express = require('express');
const { applyForJob, getMyApplications, getJobApplicants, updateApplicationStatus, getScheduledInterviews } = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/interviews', protect, getScheduledInterviews);
router.post('/:jobId', protect, authorize('student'), applyForJob);
router.get('/my', protect, authorize('student'), getMyApplications);
router.get('/job/:jobId', protect, authorize('recruiter', 'admin'), getJobApplicants);
router.patch('/:id/status', protect, authorize('recruiter'), updateApplicationStatus);

module.exports = router;
