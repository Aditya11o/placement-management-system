const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  updateAlumniProfile,
  getDirectory,
  getReferrals,
  createReferral,
  bookMentorship,
  getMentorshipRequests,
  updateMentorshipStatus,
  getReferralApplicants
} = require('../controllers/alumniController');

const { protect, authorize } = require('../middleware/authMiddleware');

// Dashboard & Profile (Alumni/Mentor Only)
router.get('/dashboard', protect, authorize('alumni', 'mentor'), getDashboardStats);
router.put('/profile', protect, authorize('alumni', 'mentor'), updateAlumniProfile);

// Referrals
router.route('/referrals')
  .get(protect, authorize('alumni', 'mentor'), getReferrals)
  .post(protect, authorize('alumni', 'mentor'), createReferral);

router.get('/referrals/:id/applicants', protect, authorize('alumni', 'mentor'), getReferralApplicants);

// Directory Access (Students)
router.get('/directory', protect, getDirectory);

// Mentorship Routes
router.post('/mentorship/request', protect, authorize('student'), bookMentorship);
router.get('/mentorship/requests', protect, getMentorshipRequests); // works for both
router.put('/mentorship/:id', protect, authorize('alumni', 'mentor'), updateMentorshipStatus);

module.exports = router;
