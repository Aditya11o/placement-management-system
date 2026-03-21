const express = require('express');
const { createJob, getJobs, updateJobStatus } = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
  .post(protect, authorize('recruiter'), createJob)
  .get(getJobs);

router.route('/:id/status')
  .patch(protect, authorize('admin', 'recruiter'), updateJobStatus);

module.exports = router;
