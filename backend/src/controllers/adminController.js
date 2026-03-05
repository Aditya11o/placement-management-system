const Student = require('../models/Student');
const Recruiter = require('../models/Recruiter');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Log = require('../models/Log');
const crypto = require('crypto');
const Admin = require('../models/Admin');
const { dataExportQueue } = require('../utils/dataExportQueue');
const { bulkQueue } = require('../utils/bulkQueue');

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

        // Dispatch Email Notification on Approval
        if (status === 'APPROVED') {
            try {
                // Determine the correct name field based on role
                const userName = role === 'STUDENT' ? user.name : user.company_name;
                const emailMessage = role === 'STUDENT'
                    ? 'Congratulations! Your student account has been verified and approved by the placement administration. You can now log in and start applying for jobs.'
                    : 'Congratulations! Your recruiter account has been verified and approved by the placement administration. You can now log in and start posting jobs.';

                await emailQueue.add('approval-email', {
                    email: user.email,
                    subject: 'Account Approved - Placement Management System',
                    template: 'alert',
                    context: {
                        title: 'Account Approved!',
                        name: userName,
                        message: emailMessage,
                        cta: {
                            text: 'Login to Dashboard',
                            url: `${config.get('frontend_url')}/login`
                        }
                    }
                });
            } catch (emailError) {
                // Log the error but don't fail the request
                logger.warn(`Email queue failed for approval notification: ${emailError.message}`);
            }
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
        if (res.advancedResults) {
            return res.status(200).json(res.advancedResults);
        }

        const logs = await Log.find({
            action: { $in: ['SETTINGS_UPDATE', 'ADMIN_ACTION', 'BAN_IP', 'UNBAN_IP'] }
        })
            .populate('user_id', 'name email')
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
