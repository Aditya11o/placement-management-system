const express = require('express');
const { createJob, getJobs, adminGetJobs, updateJobStatus, getMatchedJobs, getRecruiterStats, getRecruiterJobs, deleteJob, getJobById, getJobAnalytics } = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/admin', protect, authorize('admin', 'recruiter'), adminGetJobs);
router.get('/stats', protect, authorize('recruiter'), getRecruiterStats);
router.get('/my', protect, authorize('recruiter'), getRecruiterJobs);

router.route('/')
  .post(protect, authorize('recruiter'), createJob)
  .get(protect, getJobs);

router.get('/:id', protect, getJobById);
router.get('/:id/analytics', protect, authorize('recruiter', 'admin'), getJobAnalytics);
router.delete('/:id', protect, authorize('recruiter', 'admin'), deleteJob);

router.get('/matched', protect, authorize('student'), getMatchedJobs);

router.route('/:id/status')
  .patch(protect, authorize('admin', 'recruiter'), updateJobStatus);

module.exports = router;
