const express = require('express');
const { createJob, getJobs, adminGetJobs, updateJobStatus, getMatchedJobs, getRecruiterStats, getRecruiterJobs, updateJob, deleteJob, getJobById, getJobAnalytics, getRecruiterROI, toggleWatchlist, getWatchlist } = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateCreateJob, validateUpdateJob, validateUpdateJobStatus, validateMongoId } = require('../middleware/validateMiddleware');
const router = express.Router();

router.get('/admin', protect, authorize('admin', 'recruiter'), adminGetJobs);
router.get('/stats', protect, authorize('recruiter'), getRecruiterStats);
router.get('/roi', protect, authorize('recruiter'), getRecruiterROI);
router.get('/my', protect, authorize('recruiter'), getRecruiterJobs);

router.route('/')
  .post(protect, authorize('recruiter'), validateCreateJob, createJob)
  .get(protect, getJobs);

// Matched must be before :id
router.get('/matched', protect, authorize('student'), getMatchedJobs);
router.get('/watchlist', protect, authorize('student'), getWatchlist);
router.post('/watchlist/:id', protect, authorize('student'), validateMongoId, toggleWatchlist);

router.route('/:id')
  .get(protect, validateMongoId, getJobById)
  .put(protect, authorize('recruiter', 'admin'), validateUpdateJob, updateJob)
  .delete(protect, authorize('recruiter', 'admin'), validateMongoId, deleteJob);

router.get('/:id/analytics', protect, authorize('recruiter', 'admin'), validateMongoId, getJobAnalytics);

router.route('/:id/status')
  .patch(protect, authorize('admin', 'recruiter'), validateUpdateJobStatus, updateJobStatus);

module.exports = router;
