const express = require('express');
const { createJob, getJobs, adminGetJobs, updateJobStatus, getMatchedJobs, getRecruiterStats, getRecruiterJobs, updateJob, deleteJob, getJobById, getJobAnalytics } = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/admin', protect, authorize('admin', 'recruiter'), adminGetJobs);
router.get('/stats', protect, authorize('recruiter'), getRecruiterStats);
router.get('/my', protect, authorize('recruiter'), getRecruiterJobs);

router.route('/')
  .post(protect, authorize('recruiter'), createJob)
  .get(protect, getJobs);

router.route('/:id')
  .get(protect, getJobById)
  .put(protect, authorize('recruiter', 'admin'), updateJob)
  .delete(protect, authorize('recruiter', 'admin'), deleteJob);

router.get('/:id/analytics', protect, authorize('recruiter', 'admin'), getJobAnalytics);

router.get('/matched', protect, authorize('student'), getMatchedJobs);

router.route('/:id/status')
  .patch(protect, authorize('admin', 'recruiter'), updateJobStatus);

module.exports = router;
