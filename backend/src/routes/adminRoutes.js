const express = require('express');
const multer = require('multer');
const {
    getUsers,
    updateUserStatus,
    getDashboardStats,
    exportData,
    getSettings,
    updateSettings,
    getAllSessions,
    revokeSession,
    getEmailTemplates,
    updateEmailTemplate,
    sendTestTemplateEmail,
    uploadLogo,
    uploadFavicon,
    bulkOperations,
    getBulkJobStatus,
    getAuditLogs,
    getJobs,
    updateJobStatus,
    getApplications,
    updateApplicationStatus,
    getJobMatches,
    getLatestPulse,
    getAllInterviews,
    getCampaigns,
    createCampaign,
    getPredictiveAnalytics,
    generateApiKey,
    listApiKeys,
    revokeApiKey,
    exportMasterData,
    getSystemHealth,
    purgeData,
    updateUserInternalNotes,
    bulkUpdateUserStatus
} = require('../controllers/adminController');
const { getRecruiterPerformance } = require('../controllers/recruiterController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { apiKeyAuth } = require('../middlewares/apiKeyMiddleware');
const ipWhitelist = require('../middlewares/ipWhitelistMiddleware');
const checkPermission = require('../middlewares/checkPermission');
const { validate } = require('../middlewares/validate');
const { validateUserStatusUpdate, validateExportRequest, validateApiKeyGeneration } = require('../validations/adminValidator');

const router = express.Router();

// Dual-Auth Wrapper: Try API Key first, fallback to standard JWT Admin session
const requireAdminOrApiKey = (req, res, next) => {
    if (req.headers['x-api-key'] || req.query.api_key) {
        return apiKeyAuth(req, res, next);
    }
    return protect(req, res, () => {
        authorize('ADMIN')(req, res, next);
    });
};

// Apply middleware to all routes in this module
router.use(requireAdminOrApiKey);
router.use(ipWhitelist);

const advancedResults = require('../middlewares/advancedResults');
const Student = require('../models/Student');
const Recruiter = require('../models/Recruiter');
const Job = require('../models/Job');
const Log = require('../models/Log');

// Wrapper for advancedResults to dynamically choose model
const usersAdvancedResults = (req, res, next) => {
    if (req.query.role === 'STUDENT') {
        return advancedResults(Student)(req, res, next);
    } else if (req.query.role === 'RECRUITER') {
        return advancedResults(Recruiter)(req, res, next);
    }
    next();
};

/**
 * @swagger
 * /api/v1/admin/users:
 *   get:
 *     summary: Get all students or recruiters
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         required: true
 *         schema:
 *           type: string
 *           enum: [STUDENT, RECRUITER]
 *     responses:
 *       200:
 *         description: List of users returned
 */
router.get('/users', checkPermission('manage_students'), usersAdvancedResults, getUsers);

/**
 * @swagger
 * /api/v1/admin/users/status:
 *   put:
 *     summary: Update user status (Approve/Reject)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - role
 *               - status
 *             properties:
 *               id:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [STUDENT, RECRUITER]
 *               status:
 *                 type: string
 *                 enum: [PENDING, APPROVED, BLOCKED]
 *     responses:
 *       200:
 *         description: Status updated successfully
 */
router.put('/users/status', checkPermission('manage_students'), validateUserStatusUpdate, validate, updateUserStatus);
router.put('/users/bulk-status', checkPermission('manage_students'), bulkUpdateUserStatus);
router.put('/users/notes', checkPermission('manage_students'), updateUserInternalNotes);

/**
 * @swagger
 * /api/v1/admin/export:
 *   post:
 *     summary: Request an asynchronous CSV data export
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [students, applications]
 *     responses:
 *       202:
 *         description: Export request accepted and queued
 */
// Middleware to block API keys from managing API keys (prevent self-escalation)
const blockApiKeys = (req, res, next) => {
    if (req.isApiKeySession) {
        return res.status(403).json({ success: false, message: 'API Keys cannot access API Key management routes' });
    }
    next();
};

router.post('/export', checkPermission('export_data'), validateExportRequest, validate, exportData);
router.get('/export-master', checkPermission('export_data'), exportMasterData);
router.get('/system-health', getSystemHealth);
router.post('/purge', checkPermission('export_data'), purgeData); // Using export_data permission for purge as well for now

router.post('/api-keys', blockApiKeys, checkPermission('manage_api_keys'), validateApiKeyGeneration, validate, generateApiKey);
router.get('/api-keys', blockApiKeys, checkPermission('manage_api_keys'), listApiKeys);
router.delete('/api-keys/:id', blockApiKeys, checkPermission('manage_api_keys'), revokeApiKey);

router.get('/dashboard', getDashboardStats);
router.get('/recruiters/performance', getRecruiterPerformance);

/**
 * @swagger
 * /api/v1/admin/logs:
 *   get:
 *     summary: "[Deprecated] Use GET /api/v1/logs for full-featured audit log"
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       301:
 *         description: Moved to /api/v1/logs
 */
router.get('/logs', checkPermission('view_logs'), (req, res) => {
    res.status(301).json({
        success: false,
        message: 'This endpoint has been upgraded. Use GET /api/v1/logs for the full-featured audit log API with filtering, pagination, stats, and per-user feeds.',
        newEndpoint: '/api/v1/logs'
    });
});



// Bulk CSV Operations
// ==========================

// Configure Multer for in-memory buffer processing
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel') {
            cb(null, true);
        } else {
            cb(new Error('Only pristine .csv files are allowed.'));
        }
    },
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

/**
 * @swagger
 * /api/v1/admin/bulk:
 *   post:
 *     summary: Bulk Upload CSV
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.post('/bulk', checkPermission('manage_students'), upload.single('file'), bulkOperations);
router.get('/bulk/:jobId', getBulkJobStatus);

// ==========================
// System Settings API
// ==========================

// Ensure only SUPER_ADMIN or ADMIN can access settings routes
router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.get('/audit-logs', checkPermission('view_logs'), advancedResults(Log, { path: 'user_id', select: 'name email' }), getAuditLogs);

// Configure Multer for Logo specifically (images only)
const uploadImage = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed.'));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.post('/settings/logo', uploadImage.single('logo'), uploadLogo);
router.post('/settings/favicon', uploadImage.single('favicon'), uploadFavicon);

// ==========================
// Custom Email Templates API
// ==========================

router.get('/email-templates', getEmailTemplates);
router.put('/email-templates/:id', updateEmailTemplate);
router.post('/email-templates/:id/test', sendTestTemplateEmail);

// Job Management
router.get('/jobs', advancedResults(Job), getJobs);
router.put('/jobs/:id/status', updateJobStatus);
router.get('/jobs/:id/matches', getJobMatches);

// Application Management (Kanban)
const Application = require('../models/Application');
router.get('/applications', advancedResults(Application, [{ path: 'student_id', select: 'name email profile_image_url branch resume_url' }, { path: 'job_id', select: 'title' }]), getApplications);
router.put('/applications/:id/status', updateApplicationStatus);

// Live Command Center (Pulse Feed)
router.get('/pulse', getLatestPulse);

// Unified Interview Calendar
const Interview = require('../models/Interview');
router.get('/interviews', advancedResults(Interview, [
    { path: 'student_id', select: 'name email branch' },
    { path: 'recruiter_id', select: 'company_name contact_person' },
    { path: 'job_id', select: 'title' }
]), getAllInterviews);

// Outreach Campaigns
const Campaign = require('../models/Campaign');
router.route('/campaigns')
    .get(advancedResults(Campaign, { path: 'created_by', select: 'name' }), getCampaigns)
    .post(createCampaign);

// --- Session Management ---
router.get('/sessions', getAllSessions);
router.delete('/sessions/:id', revokeSession);

module.exports = router;
