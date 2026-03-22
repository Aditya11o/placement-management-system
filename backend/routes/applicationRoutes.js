const express = require('express');
const { 
  applyForJob, 
  getMyApplications, 
  getJobApplicants, 
  getAllApplications,
  updateApplicationStatus, 
  getScheduledInterviews,
  getStudentStats,
  getRecruiterApplicants,
  respondToOffer,
  bulkUpdateStatus,
  getExportData
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/admin', protect, authorize('admin'), getAllApplications);
router.get('/stats', protect, authorize('student'), getStudentStats);
router.get('/recruiter', protect, authorize('recruiter'), getRecruiterApplicants);
router.get('/interviews', protect, getScheduledInterviews);
router.post('/:jobId', protect, authorize('student'), applyForJob);
router.get('/my', protect, authorize('student'), getMyApplications);
router.get('/job/:jobId', protect, authorize('recruiter', 'admin'), getJobApplicants);
router.patch('/bulk-status', protect, authorize('recruiter'), bulkUpdateStatus);
router.get('/export/:jobId', protect, authorize('recruiter'), getExportData);
router.patch('/:id/status', protect, authorize('recruiter', 'admin'), updateApplicationStatus);
router.patch('/:id/offer', protect, authorize('student'), respondToOffer);

module.exports = router;
