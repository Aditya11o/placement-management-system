const express = require('express');
const { getUsers, updateUserStatus, getDashboardStats, exportData, generateApiKey, listApiKeys, revokeApiKey } = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { apiKeyAuth } = require('../middlewares/apiKeyMiddleware');
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

const advancedResults = require('../middlewares/advancedResults');
const Student = require('../models/Student');
const Recruiter = require('../models/Recruiter');
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
router.post('/export', checkPermission('export_data'), validateExportRequest, validate, exportData);

router.get('/dashboard', getDashboardStats);

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

// ==========================
// API Key Management Routes
// ==========================

// Prevent API keys from generating more API keys or revoking themselves
const ensureNotApiKey = (req, res, next) => {
    if (req.isApiKeySession) {
        return res.status(403).json({ success: false, message: 'Forbidden. API Keys cannot manage other API Keys.' });
    }
    next();
};

/**
 * @swagger
 * /api/v1/admin/api-keys:
 *   post:
 *     summary: Generate a new API key
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
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Returns raw API key once
 *   get:
 *     summary: List all active API keys
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of keys mapped by ID and Name
 */
router.post('/api-keys', ensureNotApiKey, checkPermission('manage_api_keys'), validateApiKeyGeneration, validate, generateApiKey);
router.get('/api-keys', ensureNotApiKey, checkPermission('manage_api_keys'), listApiKeys);

/**
 * @swagger
 * /api/v1/admin/api-keys/{id}:
 *   delete:
 *     summary: Revoke an API key
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: API Key revoked
 */
router.delete('/api-keys/:id', ensureNotApiKey, checkPermission('manage_api_keys'), revokeApiKey);

// ==========================
// Bulk CSV Operations
// ==========================

const multer = require('multer');
const { bulkOperations, getBulkJobStatus } = require('../controllers/adminController');

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

module.exports = router;
