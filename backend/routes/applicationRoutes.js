const express = require('express');
const { applyForJob, getMyApplications, getJobApplicants, updateApplicationStatus } = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/:jobId', protect, authorize('student'), applyForJob);
router.get('/my', protect, authorize('student'), getMyApplications);
router.get('/job/:jobId', protect, authorize('recruiter', 'admin'), getJobApplicants);
router.patch('/:id/status', protect, authorize('recruiter'), updateApplicationStatus);

module.exports = router;
