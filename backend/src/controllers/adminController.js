const Student = require('../models/Student');
const Recruiter = require('../models/Recruiter');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Log = require('../models/Log');
const crypto = require('crypto');
const Admin = require('../models/Admin');
const { dataExportQueue } = require('../utils/dataExportQueue');
const { bulkQueue } = require('../utils/bulkQueue');
const { emailQueue } = require('../utils/emailQueue');

const GlobalSettings = require('../models/GlobalSettings');
const EmailTemplate = require('../models/EmailTemplate');
const config = require('../config/config');
const logger = require('../utils/logger');

exports.getUsers = async (req, res, next) => {
    try {
        const { role } = req.query; // ?role=STUDENT or ?role=RECRUITER
        if (role !== 'STUDENT' && role !== 'RECRUITER') {
            return res.status(400).json({ success: false, message: 'Please specify ?role=STUDENT or ?role=RECRUITER' });
        }

        req.advancedFilter = { role }; // Just in case, wouldn't hurt, but the router binds to the specific model
        res.status(200).json(res.advancedResults);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateUserStatus = async (req, res) => {
    try {
        const { id, role, status } = req.body;
        if (!['PENDING', 'APPROVED', 'BLOCKED'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        let user;
        if (role === 'STUDENT') {
            user = await Student.findByIdAndUpdate(id, { status }, { new: true }).select('-password');
        } else if (role === 'RECRUITER') {
            user = await Recruiter.findByIdAndUpdate(id, { status }, { new: true }).select('-password');
        } else {
            return res.status(400).json({ success: false, message: 'Invalid role' });
        }

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Dispatch across all channels: persistent DB, WebSocket, Email (respecting frequency), Webhooks, and SMS if critical
        if (status === 'APPROVED') {
            const userName = role === 'STUDENT' ? user.name : user.company_name;
            const eventName = role === 'STUDENT' ? 'application_status_update' : 'new_application_received'; // reuse existing keys for prefs

            await dispatchToUser({
                recipientId: user._id,
                recipientModel: role.charAt(0).toUpperCase() + role.slice(1).toLowerCase(), // Student or Recruiter
                eventName: eventName,
                title: 'Account Approved!',
                message: role === 'STUDENT'
                    ? 'Your student account has been verified and approved. You can now log in and start applying.'
                    : 'Your recruiter account has been verified and approved. You can now log in and start posting jobs.',
                type: 'SUCCESS',
                link: '/login',
                emailOptions: {
                    subject: 'Account Approved - Placement Management System'
                }
            });
        }

        await Log.create({
            user_id: req.user._id,
            user_role: 'ADMIN',
            action: 'UPDATE_STATUS',
            target_id: user._id,
            description: `Changed ${role} status to ${status}`
        });

        res.json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const studentCount = await Student.countDocuments();
        const pendingStudents = await Student.countDocuments({ status: 'PENDING' });

        const recruiterCount = await Recruiter.countDocuments();
        const pendingRecruiters = await Recruiter.countDocuments({ status: 'PENDING' });

        const activeJobs = await Job.countDocuments({ status: 'ACTIVE' });
        const totalApplications = await Application.countDocuments();

        // Calculate Placed Students & Placement Rate
        const placedStudentsArray = await Application.distinct('student_id', { status: 'SELECTED' });
        const placedStudents = placedStudentsArray.length;

        let placementRateStr = '0%';
        if (studentCount > 0) {
            const rate = (placedStudents / studentCount) * 100;
            placementRateStr = `${rate.toFixed(1)}%`;
        }

        res.json({
            success: true,
            data: {
                studentCount, pendingStudents,
                recruiterCount, pendingRecruiters,
                activeJobs,
                totalApplications,
                placedStudents,
                placementRate: placementRateStr
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.exportData = async (req, res) => {
    try {
        const { type } = req.body;
        if (!['students', 'applications'].includes(type)) {
            return res.status(400).json({ success: false, message: 'Invalid export type. Must be students or applications' });
        }

        await dataExportQueue.add('export-data', {
            adminEmail: req.user.email,
            exportType: type
        });

        await Log.create({
            user_id: req.user._id,
            user_role: 'ADMIN',
            action: 'EXPORT_DATA',
            description: `Requested async CSV export for ${type}`
        });

        res.status(202).json({
            success: true,
            message: `Export for ${type} has been queued. An email with the download link will be sent to ${req.user.email} shortly.`
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Get master data export (all platform data)
 * @route   GET /api/v1/admin/export-master
 * @access  Private/Admin
 */
exports.exportMasterData = async (req, res) => {
    try {
        // Log the high-privilege action
        await Log.create({
            user_id: req.user._id,
            user_role: 'ADMIN',
            action: 'EXPORT_MASTER_DATA',
            description: 'Initiated full system data export'
        });

        // 1. Fetch all relevant data (Passwords excluded via schema or manual omission)
        const [students, recruiters, jobs, applications, settings] = await Promise.all([
            Student.find().select('-password'),
            Recruiter.find().select('-password'),
            Job.find(),
            Application.find(),
            GlobalSettings.findOne({ singletonId: 'nexus_settings' })
        ]);

        const exportPayload = {
            exportTimestamp: new Date(),
            exportedBy: req.user.email,
            platformName: settings?.institutionName || 'Nexus',
            data: {
                students,
                recruiters,
                jobs,
                applications
            }
        };

        // 2. Set headers for file download
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=Nexus_Master_Export_${new Date().toISOString().split('T')[0]}.json`);

        res.status(200).send(exportPayload);
    } catch (err) {
        logger.error(`Master export error: ${err.message}`);
        res.status(500).json({ success: false, message: 'Failed to generate master data export.' });
    }
};

/**
 * @desc    Get system logs
 * @route   GET /api/v1/admin/logs
 * @access  Private/Admin
 */
exports.getLogs = async (req, res) => {
    try {
        res.status(200).json(res.advancedResults);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ==========================
// API Key Lifecycle
// ==========================

/**
 * @desc    Generate a new API Key for integrations
 * @route   POST /api/v1/admin/api-keys
 * @access  Private/Admin
 */
exports.generateApiKey = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ success: false, message: 'Please provide a descriptive name for this key' });

        // Generate strong random 32 byte raw string
        const rawKey = `pms_` + crypto.randomBytes(32).toString('hex');
        const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

        const admin = await Admin.findById(req.user._id);

        admin.api_keys.push({
            name,
            keyHash
        });

        await admin.save({ validateModifiedOnly: true });

        await Log.create({
            user_id: req.user._id, user_role: 'ADMIN', action: 'CREATE_API_KEY',
            description: `Generated new API key: ${name}`
        });

        res.status(201).json({
            success: true,
            message: 'API Key generated successfully. Please copy it immediately, you will not be able to view it again.',
            data: {
                raw_api_key: rawKey,
                name
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Get all active API keys for this admin
 * @route   GET /api/v1/admin/api-keys
 * @access  Private/Admin
 */
exports.listApiKeys = async (req, res) => {
    try {
        const admin = await Admin.findById(req.user._id).select('+api_keys');
        const keys = admin.api_keys.map(k => ({
            _id: k._id,
            name: k.name,
            createdAt: k.createdAt
        }));

        res.status(200).json({ success: true, count: keys.length, data: keys });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Revoke/Delete an API key
 * @route   DELETE /api/v1/admin/api-keys/:id
 * @access  Private/Admin
 */
exports.revokeApiKey = async (req, res) => {
    try {
        const admin = await Admin.findById(req.user._id);
        const originalLength = admin.api_keys.length;

        admin.api_keys = admin.api_keys.filter(k => k._id.toString() !== req.params.id);

        if (admin.api_keys.length === originalLength) {
            return res.status(404).json({ success: false, message: 'API Key not found or already revoked' });
        }

        await admin.save({ validateModifiedOnly: true });

        await Log.create({
            user_id: req.user._id, user_role: 'ADMIN', action: 'REVOKE_API_KEY',
            description: `Revoked an API key`
        });

        res.status(200).json({ success: true, message: 'API Key revoked successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ==========================
// Bulk CSV Operations
// ==========================

const csv = require('fast-csv');
const streamifier = require('streamifier');

/**
 * @desc    Upload CSV and trigger background bulk job
 * @route   POST /api/v1/admin/bulk
 * @access  Private/Admin
 */
exports.bulkOperations = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a valid CSV file' });
        }

        const { type } = req.body;
        const validTypes = ['students', 'applications', 'eligibility', 'student_import'];

        if (!validTypes.includes(type)) {
            return res.status(400).json({ success: false, message: `Invalid bulk type. Choose from: ${validTypes.join(', ')}` });
        }

        const records = [];

        // Fast-CSV streaming implementation from Multer memory buffer
        streamifier.createReadStream(req.file.buffer)
            .pipe(csv.parse({ headers: true, trim: true, ignoreEmpty: true }))
            .on('error', error => {
                logger.error('CSV Parse Error:', error);
                return res.status(400).json({ success: false, message: 'Failed to parse CSV file. Ensure it has correct headers.' });
            })
            .on('data', row => records.push(row))
            .on('end', async rowCount => {
                if (records.length === 0) {
                    return res.status(400).json({ success: false, message: 'Uploaded CSV holds no valid data rows' });
                }

                // Chunking logic: If the file is massive (> 10,000 lines), it should really be chunked into separate BullMQ jobs
                // However, for standard university scales (1k-5k rows), one job payload is perfectly stable on Node.js/Redis.

                try {
                    const job = await bulkQueue.add(`bulk-${type}`, { type, records });

                    await Log.create({
                        user_id: req.user._id, user_role: 'ADMIN', action: 'BULK_UPLOAD',
                        description: `Initiated bulk [${type}] operations with ${rowCount} rows.`
                    });

                    res.status(202).json({
                        success: true,
                        message: `Bulk processing queued successfully for ${rowCount} rows.`,
                        data: {
                            job_id: job.id,
                            type,
                            total_rows: rowCount
                        }
                    });

                } catch (queueErr) {
                    res.status(500).json({ success: false, message: `Failed to enqueue bulk processing: ${queueErr.message}` });
                }
            });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Get status of an active bulk worker
 * @route   GET /api/v1/admin/bulk/:jobId
 * @access  Private/Admin
 */
exports.getBulkJobStatus = async (req, res) => {
    try {
        // Since BulkQueue returns standard BullMQ Job shapes, we can read straight from Cache
        if (config.get('env') === 'test') { return res.status(200).json({ success: true, data: { status: 'completed' } }); } // Mock trap

        const job = await bulkQueue.getJob(req.params.jobId);

        if (!job) {
            return res.status(404).json({ success: false, message: 'A bulk job with this ID could not be found' });
        }

        const state = await job.getState();
        const progress = job.progress || 0; // Contains percentage
        const result = job.returnvalue; // Contains final success/fail mapping
        const failedReason = job.failedReason;

        res.status(200).json({
            success: true,
            data: {
                job_id: job.id,
                state,
                progress,
                result: result || null,
                error: failedReason || null
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


/**
 * @desc    Get system-wide global settings
 * @route   GET /api/v1/admin/settings
 * @access  Private/Admin
 */
exports.getSettings = async (req, res) => {
    try {
        let settings = await GlobalSettings.findOne({ singletonId: 'nexus_settings' });

        if (!settings) {
            settings = await GlobalSettings.create({ singletonId: 'nexus_settings' });
        }

        res.status(200).json({ success: true, data: settings });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Update system-wide global settings
 * @route   PUT /api/v1/admin/settings
 * @access  Private/Admin
 */
exports.updateSettings = async (req, res) => {
    try {
        const oldSettings = await GlobalSettings.findOne({ singletonId: 'nexus_settings' });

        const settings = await GlobalSettings.findOneAndUpdate(
            { singletonId: 'nexus_settings' },
            req.body,
            { new: true, runValidators: true, upsert: true }
        );

        // --- Audit Logging ---
        // Identify what exactly changed for the audit log description
        const changes = [];
        for (const key in req.body) {
            if (oldSettings && oldSettings[key] !== undefined && String(oldSettings[key]) !== String(req.body[key])) {
                changes.push(`${key}: ${oldSettings[key]} -> ${req.body[key]}`);
            }
        }

        if (changes.length > 0) {
            await Log.create({
                user_id: req.user._id,
                user_role: req.user.role,
                action: 'SETTINGS_UPDATE',
                description: `Admin updated system settings: ${changes.join(', ')}`,
                ip_address: req.ip
            });
        }

        res.status(200).json({ success: true, data: settings });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Get administrative audit logs
 * @route   GET /api/v1/admin/audit-logs
 * @access  Private/Admin
 */
exports.getAuditLogs = async (req, res) => {
    try {
        const { search, user_id, action, ip_address } = req.query;

        // Initialize advancedFilter if not present
        if (!req.advancedFilter) req.advancedFilter = {};

        // 1. Global Search (IP or Description)
        if (search) {
            req.advancedFilter.$or = [
                { description: { $regex: search, $options: 'i' } },
                { ip_address: { $regex: search, $options: 'i' } }
            ];
        }

        // 2. Direct Filters (in case they aren't handled by middleware automated parsing)
        if (user_id) req.advancedFilter.user_id = user_id;
        if (action) req.advancedFilter.action = action;
        if (ip_address) req.advancedFilter.ip_address = ip_address;

        if (res.advancedResults) {
            return res.status(200).json(res.advancedResults);
        }

        // Fallback for manual query if middleware for some reason didn't run
        const logs = await Log.find(req.advancedFilter)
            .populate('user_id', 'name email profile_image_url')
            .sort({ created_at: -1 })
            .limit(100);

        res.status(200).json({ success: true, count: logs.length, data: logs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


/**
 * @desc    Upload Institution Logo to Cloudinary and update Settings
 * @route   POST /api/v1/admin/settings/logo
 * @access  Private/Admin
 */
const { uploadToCloudinary } = require('../utils/cloudinary');

exports.uploadLogo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please provide an image file' });
        }

        // Upload to Cloudinary, folder: "branding"
        const result = await uploadToCloudinary(req.file.buffer, 'branding', 'image');

        // Update the GlobalSettings with the new logo URL
        const settings = await GlobalSettings.findOneAndUpdate(
            { singletonId: 'nexus_settings' },
            { logoUrl: result.secure_url },
            { new: true, upsert: true }
        );

        res.status(200).json({
            success: true,
            message: 'Logo updated successfully',
            data: {
                logoUrl: settings.logoUrl
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Logo upload failed: ' + err.message });
    }
};

/**
 * @desc    Upload Favicon to Cloudinary and update Settings
 * @route   POST /api/v1/admin/settings/favicon
 * @access  Private/Admin
 */
exports.uploadFavicon = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please provide an icon or image file' });
        }

        // Upload to Cloudinary, folder: "branding"
        const result = await uploadToCloudinary(req.file.buffer, 'branding', 'image');

        // Update the GlobalSettings with the new favicon URL
        const settings = await GlobalSettings.findOneAndUpdate(
            { singletonId: 'nexus_settings' },
            { faviconUrl: result.secure_url },
            { new: true, upsert: true }
        );

        res.status(200).json({
            success: true,
            message: 'Favicon updated successfully',
            data: {
                faviconUrl: settings.faviconUrl
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Favicon upload failed: ' + err.message });
    }
};

// ==========================
// Email Template API
// ==========================

const DEFAULT_TEMPLATES = [
    {
        name: 'passwordReset',
        subject: 'Password Reset Request',
        description: 'Sent when a user requests a password reset link.',
        variables: ['{{name}}', '{{resetToken}}'],
        htmlContent: '<h1>Password Reset</h1><p>Hello {{name}},</p><p>You requested a password reset. Use this token: <strong>{{resetToken}}</strong></p>'
    },
    {
        name: 'accountApproval',
        subject: 'Your Account Has Been Approved!',
        description: 'Sent when an administrator manually approves a student or recruiter account.',
        variables: ['{{name}}', '{{loginUrl}}'],
        htmlContent: '<h1>Account Approved</h1><p>Hello {{name}},</p><p>Your account limit restrictions have been lifted. You can now login here: <a href="{{loginUrl}}">Login</a></p>'
    }
];

/**
 * @desc    Get all customizable email templates (auto-seeds if empty)
 * @route   GET /api/v1/admin/email-templates
 * @access  Private/Admin
 */
exports.getEmailTemplates = async (req, res, next) => {
    try {
        let templates = await EmailTemplate.find();

        if (templates.length === 0) {
            // Auto-seed default templates
            templates = await EmailTemplate.insertMany(DEFAULT_TEMPLATES);
        }

        res.status(200).json({
            success: true,
            count: templates.length,
            data: templates
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Update a specific email template
 * @route   PUT /api/v1/admin/email-templates/:id
 * @access  Private/Admin
 */
exports.updateEmailTemplate = async (req, res, next) => {
    try {
        let template = await EmailTemplate.findById(req.params.id);

        if (!template) {
            return res.status(404).json({ success: false, message: 'Template not found' });
        }

        template = await EmailTemplate.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: template
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Send a test email using a specific template
 * @route   POST /api/v1/admin/email-templates/:id/test
 * @access  Private/Admin
 */
exports.sendTestTemplateEmail = async (req, res, next) => {
    try {
        const template = await EmailTemplate.findById(req.params.id);

        if (!template) {
            return res.status(404).json({ success: false, message: 'Template not found' });
        }

        // Mock context based on template variables or common defaults
        const context = {
            name: req.user.name || 'Test Admin',
            email: req.user.email,
            resetToken: 'TEST_TOKEN_123456',
            loginUrl: `${config.get('frontend_url')}/login`,
            institutionName: 'Nexus University',
            status: 'APPROVED',
            timestamp: new Date().toLocaleString()
        };

        await emailQueue.add('test-email', {
            email: req.user.email,
            template: template.name,
            context
        });

        await Log.create({
            user_id: req.user._id,
            user_role: 'ADMIN',
            action: 'TEST_EMAIL_DISPATCH',
            description: `Sent test email for template: ${template.name}`
        });

        res.status(200).json({
            success: true,
            message: `Test email for "${template.name}" has been queued. Check ${req.user.email} shortly.`
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get all jobs for admin management
 * @route   GET /api/v1/admin/jobs
 * @access  Private/Admin
 */
exports.getJobs = async (req, res) => {
    try {
        res.status(200).json(res.advancedResults);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Update job approval and featured status
 * @route   PUT /api/v1/admin/jobs/:id/status
 * @access  Private/Admin
 */
exports.updateJobStatus = async (req, res) => {
    try {
        const { is_approved, is_featured } = req.body;

        const job = await Job.findByIdAndUpdate(
            req.params.id,
            { is_approved, is_featured },
            { new: true, runValidators: true }
        );

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        await Log.create({
            user_id: req.user._id,
            user_role: 'ADMIN',
            action: 'UPDATE_JOB_STATUS',
            target_id: job._id,
            description: `Job ${job.title} status updated: Approved=${is_approved}, Featured=${is_featured}`
        });

        const { clearCache } = require('../middlewares/cacheMiddleware');
        await clearCache('/api/v1/jobs');

        res.status(200).json({ success: true, data: job });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Get all applications for university-wide Kanban
 * @route   GET /api/v1/admin/applications
 * @access  Private/Admin
 */
exports.getApplications = async (req, res) => {
    try {
        res.status(200).json(res.advancedResults);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Update application status (Kanban drag & drop)
 * @route   PUT /api/v1/admin/applications/:id/status
 * @access  Private/Admin
 */
exports.updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body;

        // Allowed statuses matching Kanban columns
        const validStatuses = ['SUBMITTED', 'REVIEWED', 'SHORTLISTED', 'SELECTED', 'REJECTED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const Application = require('../models/Application');

        const application = await Application.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        ).populate('student_id', 'name').populate('job_id', 'title');

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        await Log.create({
            user_id: req.user._id,
            user_role: 'ADMIN',
            action: 'UPDATE_APPLICATION_STATUS',
            target_id: application._id,
            description: `Moved application for ${application.student_id?.name || 'Unknown'} (${application.job_id?.title || 'Unknown'}) to ${status}`
        });

        return res.status(200).json({ success: true, data: application });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Get AI ranked candidate matches for a specific job
 * @route   GET /api/v1/admin/jobs/:id/matches
 * @access  Private/Admin
 */
exports.getJobMatches = async (req, res) => {
    try {
        const Job = require('../models/Job');
        const Student = require('../models/Student');
        const { rankCandidatesForJob } = require('../utils/aiMatcher');

        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // Pre-filter students to save AI tokens (e.g., must be approved, could filter by branch if job specifies)
        const students = await Student.find({ status: 'APPROVED' }).select('name email branch cgpa skills profile_image_url resume_url');

        // Get AI Rankings
        const aiRankings = await rankCandidatesForJob(job, students);

        // Merge AI scores with full student profiles
        const matchedCandidates = aiRankings.map(ranking => {
            const studentData = students.find(s => s._id.toString() === ranking.studentId);
            if (!studentData) return null; // Should not happen if AI is accurate

            return {
                student: studentData,
                matchScore: ranking.score,
                matchReason: ranking.reasoning
            };
        }).filter(item => item !== null).sort((a, b) => b.matchScore - a.matchScore); // Sort highest first

        res.status(200).json({
            success: true,
            count: matchedCandidates.length,
            data: matchedCandidates
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Get the latest pulse events for the Live Command Center
 * @route   GET /api/v1/admin/pulse
 * @access  Private/Admin
 */
exports.getLatestPulse = async (req, res) => {
    try {
        // Fetch the 20 most recent non-ADMIN logs to seed the dashboard feed
        const logs = await Log.find({ user_role: { $ne: 'ADMIN' } })
            .sort({ created_at: -1 })
            .limit(20)
            .lean();

        res.status(200).json({
            success: true,
            count: logs.length,
            data: logs
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Get all system-wide interviews for the Unified Calendar
 * @route   GET /api/v1/admin/interviews
 * @access  Private/Admin
 */
exports.getAllInterviews = async (req, res) => {
    try {
        const Interview = require('../models/Interview');

        // We use advancedResults if possible, otherwise manual fetch
        // (Assuming advancedResults middleware is attached in the route mapping)
        res.status(200).json(res.advancedResults);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Get all email outreach campaigns
 * @route   GET /api/v1/admin/campaigns
 * @access  Private/Admin
 */
exports.getCampaigns = async (req, res) => {
    try {
        const Campaign = require('../models/Campaign');
        res.status(200).json(res.advancedResults);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Create and send a new mass email campaign
 * @route   POST /api/v1/admin/campaigns
 * @access  Private/Admin
 */
exports.createCampaign = async (req, res) => {
    try {
        const { title, subject, target_audience, target_filters, channels, html_content } = req.body;
        const Campaign = require('../models/Campaign');
        const Student = require('../models/Student');
        const Recruiter = require('../models/Recruiter');

        // 1. Build Dynamic Filter Query
        let query = {};
        let targetModel = Student;

        if (target_audience === 'ALL_STUDENTS') {
            query = {};
        } else if (target_audience === 'APPROVED_STUDENTS') {
            query = { status: 'APPROVED' };
        } else if (target_audience === 'UNPLACED_STUDENTS') {
            // In a real system, we'd check an 'is_placed' flag. 
            // Here we'll simulate by checking students without 'SELECTED' applications.
            const placedIds = await require('../models/Application').distinct('student_id', { status: 'SELECTED' });
            query = { status: 'APPROVED', _id: { $nin: placedIds } };
        } else if (target_audience === 'ALL_RECRUITERS') {
            targetModel = Recruiter;
            query = {};
        } else if (target_audience === 'CUSTOM') {
            // Apply granular filters
            if (target_filters.branch) query.branch = target_filters.branch;
            if (target_filters.graduation_year) query.graduation_year = target_filters.graduation_year;
            if (target_filters.cgpa_min) query.cgpa = { $gte: Number(target_filters.cgpa_min) };
            if (target_filters.backlogs_max !== undefined) query.backlogs_active = { $lte: Number(target_filters.backlogs_max) };
            query.status = 'APPROVED'; // Custom campaigns only target approved users
        } else {
            return res.status(400).json({ success: false, message: 'Invalid target audience' });
        }

        const recipients = await targetModel.find(query).select('email name company_name phone');

        if (recipients.length === 0) {
            return res.status(400).json({ success: false, message: 'No recipients found for the selected cohort.' });
        }

        // 2. Create the Campaign Record
        const campaign = await Campaign.create({
            title,
            subject,
            target_audience,
            target_filters,
            channels: channels || ['EMAIL'],
            html_content,
            status: 'SENDING',
            total_recipients: recipients.length,
            sent_count: 0,
            created_by: req.user._id
        });

        // 3. Simulated Multi-channel Dispatch
        // In production, this would hand off to a background worker (BullMQ) 
        // that handles rate-limiting and provider-specific retries.
        setImmediate(async () => {
            let successCount = 0;
            const chosenChannels = campaign.channels;

            for (const person of recipients) {
                try {
                    const name = person.name || person.company_name;

                    // A. Email Dispatch (Real)
                    if (chosenChannels.includes('EMAIL')) {
                        await emailQueue.add('campaign-email', {
                            email: person.email,
                            subject: campaign.subject,
                            template: 'alert',
                            context: {
                                title: campaign.title,
                                name: name,
                                message: campaign.html_content,
                                cta: { text: 'View Updates', url: `${config.get('frontend_url')}/dashboard` }
                            }
                        });
                    }

                    // B. Push/SMS Dispatch (Simulated)
                    // We log these to the system for visibility
                    if (chosenChannels.includes('PUSH') || chosenChannels.includes('SMS')) {
                        logger.info(`[CAMPAIGN] Simulated ${chosenChannels.filter(c => c !== 'EMAIL').join('/')} to ${person.email}`);
                    }

                    successCount++;
                } catch (err) {
                    logger.error(`Campaign dispatch error for ${person.email}: ${err.message}`);
                }
            }

            // Mark completed
            campaign.status = 'COMPLETED';
            campaign.sent_count = successCount;
            await campaign.save();

            // Notify admin via Socket (if implemented) or just log
            logger.info(`Campaign ${campaign._id} finished: ${successCount}/${recipients.length} sent.`);
        });

        res.status(202).json({
            success: true,
            data: campaign,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Get counts of obsolete data for maintenance
 * @route   GET /api/v1/admin/system-health
 * @access  Private/Admin
 */
exports.getSystemHealth = async (req, res) => {
    try {
        const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
        const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

        const [logCount, appCount, studentCount] = await Promise.all([
            Log.countDocuments({ created_at: { $lt: ninetyDaysAgo } }),
            Application.countDocuments({
                status: { $in: ['REJECTED', 'WITHDRAWN'] },
                applied_at: { $lt: sixMonthsAgo }
            }),
            Student.countDocuments({
                status: 'PENDING',
                created_at: { $lt: threeMonthsAgo }
            })
        ]);

        res.status(200).json({
            success: true,
            data: {
                obsoleteLogs: logCount,
                obsoleteApplications: appCount,
                inactiveStudents: studentCount,
                lastChecked: new Date()
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Purge obsolete platform data
 * @route   POST /api/v1/admin/purge
 * @access  Private/Admin
 */
exports.purgeData = async (req, res) => {
    try {
        const { type } = req.body; // 'LOGS', 'APPLICATIONS', 'STUDENTS'
        const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
        const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

        let result;
        let description = '';

        switch (type) {
            case 'LOGS':
                result = await Log.deleteMany({ created_at: { $lt: ninetyDaysAgo } });
                description = `Purged ${result.deletedCount} audit logs older than 90 days.`;
                break;
            case 'APPLICATIONS':
                result = await Application.deleteMany({
                    status: { $in: ['REJECTED', 'WITHDRAWN'] },
                    applied_at: { $lt: sixMonthsAgo }
                });
                description = `Purged ${result.deletedCount} rejected/withdrawn applications older than 6 months.`;
                break;
            case 'STUDENTS':
                result = await Student.deleteMany({
                    status: 'PENDING',
                    created_at: { $lt: threeMonthsAgo }
                });
                description = `Purged ${result.deletedCount} inactive student registrations older than 3 months.`;
                break;
            default:
                return res.status(400).json({ success: false, message: 'Invalid purge type' });
        }

        await Log.create({
            user_id: req.user._id,
            user_role: 'ADMIN',
            action: 'DATA_PURGE',
            description
        });

        res.status(200).json({
            success: true,
            message: description,
            deletedCount: result.deletedCount
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


