const { 
  getAdminMe, updateAdminProfile,
  getStats, getUsers, verifyUser, sendBroadcast, 
  getInterviews, getPlacementReports, getRecentActivities,
  getPendingVerifications, verifySkill, getCompanyHistory, getAdvancedAnalytics,
  getPendingRecruiters, approveRecruiter,
  createStudent, createRecruiter, runVerificationBatch,
  getSystemSettings, updateSystemSettings,
  unlockUserAccount, bulkUpdateUsers, bulkSendEmail, bulkVerifySkills,
  bulkVerifyAcademics, getComplianceStats, verifyOfferLetter,
  getAdminTeam, inviteAdmin, updateAdminLevel
} = require('../controllers/adminController');
const { archiveYear, getArchives } = require('../controllers/archiveController');
const { protect, authorize, authorizeLevel } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/me', getAdminMe);
router.patch('/me', updateAdminProfile);
router.get('/stats', getStats);
router.get('/activities', getRecentActivities);
router.get('/users', getUsers);
router.patch('/users/:id/verify', verifyUser);
router.post('/students', createStudent);
router.post('/recruiters', createRecruiter);
router.post('/verify-batch', runVerificationBatch);

// Team Management (Super Admin Only)
router.get('/team', authorizeLevel('SUPER_ADMIN'), getAdminTeam);
router.post('/invite', authorizeLevel('SUPER_ADMIN'), inviteAdmin);
router.patch('/team/:id', authorizeLevel('SUPER_ADMIN'), updateAdminLevel);

router.get('/settings', getSystemSettings);
router.patch('/settings', authorizeLevel('SUPER_ADMIN'), updateSystemSettings);
router.get('/interviews', getInterviews);
router.get('/reports/placements', getPlacementReports);
router.get('/analytics', getAdvancedAnalytics);
router.get('/verifications', getPendingVerifications);
router.patch('/verifications/:profileId/:verificationId', verifySkill);
router.get('/recruiters/:id/history', getCompanyHistory);
router.get('/pending-recruiters', getPendingRecruiters);
router.patch('/recruiters/:id/approve', approveRecruiter);
router.patch('/users/:id/unlock', unlockUserAccount);
router.patch('/users/bulk', bulkUpdateUsers);
router.post('/users/bulk-email', bulkSendEmail);
router.patch('/verifications/bulk', bulkVerifySkills);
router.get('/students/compliance', getComplianceStats);
router.patch('/students/bulk-academic-verify', bulkVerifyAcademics);

router.patch('/applications/:id/verify-offer', verifyOfferLetter);

// Archive Routes
router.post('/archive', authorizeLevel('SUPER_ADMIN'), archiveYear);
router.get('/archives', getArchives);

module.exports = router;
