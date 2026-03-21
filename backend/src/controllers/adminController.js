const Student = require('../models/Student');
const Recruiter = require('../models/Recruiter');
const Job = require('../models/Job');
const Application = require('../models/Application');
const campaignService = require('../services/campaignService');
const mongoose = require('mongoose');
const Log = require('../models/Log');
const crypto = require('crypto');
const Admin = require('../models/Admin');
const { dataExportQueue } = require('../utils/dataExportQueue');
const { bulkQueue } = require('../utils/bulkQueue');
const { emailQueue } = require('../utils/emailQueue');

const GlobalSettings = require('../models/GlobalSettings');
const EmailTemplate = require('../models/EmailTemplate');
const Session = require('../models/Session');
const config = require('../config/config');
const logger = require('../utils/logger');
const { dispatchToUser, dispatchToRole } = require('../services/notifyDispatcher');
const { generateOfferLetter } = require('../services/offerLetterService');

exports.getUsers = async (req, res, next) => {
    try {
        const { role } = req.query; // ?role=STUDENT or ?role=RECRUITER
        if (role !== 'STUDENT' && role !== 'RECRUITER') {
            return res.status(400).json({ success: false, message: 'Please specify ?role=STUDENT or ?role=RECRUITER' });
        }

        req.advancedFilter = { role }; // Just in case, wouldn't hurt, but the router binds to the specific model
        res.status(200).json(res.advancedResults);
    } catch (err) {
        next(err);
    }
};

exports.updateUserStatus = async (req, res, next) => {
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

        // Real-time Collaboration: Notify all admins
        dispatchToRole('ADMIN', 'admin:status_update', {
            id,
            role,
            status,
            updatedBy: req.user._id
        });

        res.json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
};

exports.bulkUpdateUserStatus = async (req, res, next) => {
    try {
        const { ids, role, status } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, message: 'Please provide an array of user IDs' });
        }
        if (!['PENDING', 'APPROVED', 'BLOCKED'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        let model;
        if (role === 'STUDENT') model = Student;
        else if (role === 'RECRUITER') model = Recruiter;
        else return res.status(400).json({ success: false, message: 'Invalid role' });

        const result = await model.updateMany(
            { _id: { $in: ids } },
            { $set: { status } }
        );

        // Audit Log
        await Log.create({
            user_id: req.user._id,
            user_role: 'ADMIN',
            action: 'BULK_UPDATE_STATUS',
            description: `Bulk updated ${result.modifiedCount} ${role}s to ${status}`,
            metadata: { count: result.modifiedCount, ids }
        });

        // Async: Dispatch notifications for approved users
        if (status === 'APPROVED') {
            const users = await model.find({ _id: { $in: ids } }).select('_id name email company_name');
            for (const user of users) {
                const eventName = role === 'STUDENT' ? 'application_status_update' : 'new_application_received';
                dispatchToUser({
                    recipientId: user._id,
                    recipientModel: role.charAt(0).toUpperCase() + role.slice(1).toLowerCase(),
                    eventName: eventName,
                    title: 'Account Approved!',
                    message: `Your ${role.toLowerCase()} account has been verified and approved.`,
                    type: 'SUCCESS',
                    link: '/login'
                }).catch(err => logger.error(`Bulk Notify Error: ${err.message}`));
            }
        }

        // Real-time Collaboration: Notify all admins
        dispatchToRole('ADMIN', 'admin:status_update', {
            ids,
            role,
            status,
            isBulk: true,
            updatedBy: req.user._id
        });

        res.status(200).json({
            success: true,
            message: `Successfully updated ${result.modifiedCount} users to ${status}`
        });
    } catch (err) {
        next(err);
    }
};

exports.updateUserInternalNotes = async (req, res, next) => {
    try {
        const { id, role, notes } = req.body;
        
        let user;
        if (role === 'STUDENT') {
            user = await Student.findByIdAndUpdate(id, { internal_notes: notes }, { new: true }).select('-password');
        } else if (role === 'RECRUITER') {
            user = await Recruiter.findByIdAndUpdate(id, { internal_notes: notes }, { new: true }).select('-password');
        } else if (role === 'ADMIN') {
            user = await Admin.findByIdAndUpdate(id, { internal_notes: notes }, { new: true }).select('-password');
        } else {
            return res.status(400).json({ success: false, message: 'Invalid role' });
        }

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        await Log.create({
            user_id: req.user._id,
            user_role: 'ADMIN',
            action: 'UPDATE_INTERNAL_NOTES',
            target_id: user._id,
            description: `Updated internal notes for ${role}: ${user.name || user.company_name}`
        });

        res.json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Manually trigger offer letter generation for a student
 * @route   POST /api/v1/admin/applications/:id/generate-offer
 * @access  Private/Admin
 */
exports.generateManualOfferLetter = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { issueDate, expiryDate } = req.body;

        const application = await Application.findById(id)
            .populate('job_id')
            .populate('student_id', 'name email');

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        // TPO can generate offer letters even if status isn't yet SELECTED (manual override)
        // or re-generate if already SELECTED.
        
        const pdfUrl = await generateOfferLetter({
            student: { name: application.student_id.name, email: application.student_id.email },
            job: application.job_id,
            applicationId: application._id.toString(),
            issueDate,
            expiryDate
        });

        if (!pdfUrl) {
            return res.status(500).json({ success: false, message: 'Failed to generate PDF offer letter' });
        }

        // Update application
        await Application.findByIdAndUpdate(id, {
            offer_letter_url: pdfUrl,
            offer_letter_generated_at: new Date(),
            offer_issued_at: issueDate || new Date(),
            offer_expires_at: expiryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        await Log.create({
            user_id: req.user._id,
            user_role: 'ADMIN',
            action: 'GENERATE_OFFER_LETTER',
            target_id: application._id,
            description: `Manually generated offer letter for ${application.student_id.name}`
        });

        res.status(200).json({
            success: true,
            message: 'Offer letter generated successfully',
            data: { pdfUrl }
        });
    } catch (err) {
        next(err);
    }
};

exports.getDashboardStats = async (req, res, next) => {
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
        next(err);
    }
};

exports.exportData = async (req, res, next) => {
    try {
        const { type, justification, userIds } = req.body;
        if (!['students', 'applications', 'recruiters'].includes(type)) {
            return res.status(400).json({ success: false, message: 'Invalid export type. Must be students, applications or recruiters' });
        }

        await dataExportQueue.add('export-data', {
            adminEmail: req.user.email,
            exportType: type,
            justification: justification || 'No justification provided',
            userIds: userIds || []
        });

        await Log.create({
            user_id: req.user._id,
            user_role: 'ADMIN',
            action: 'EXPORT_DATA',
            description: `Requested async CSV export for ${type}`,
            metadata: { justification }
        });

        res.status(202).json({
            success: true,
            message: `Export for ${type} has been queued. An email with the download link will be sent to ${req.user.email} shortly.`
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get master data export (all platform data)
 * @route   GET /api/v1/admin/export-master
 * @access  Private/Admin
 *
 * --- Memory Optimization ---
 * Previously, this loaded ALL documents from 4 collections into memory at once
 * using Model.find(). With 50k+ records across collections, this could consume
 * hundreds of MBs and crash the Node.js process (heap out of memory).
 *
 * The refactored version uses Mongoose cursors to stream documents one-by-one
 * into the HTTP response. Memory usage stays constant (~few KB) regardless of
 * how many records exist in the database.
 *
 * The JSON output format is identical to the old version, so the frontend/download
 * behaviour is fully backward-compatible.
 */
exports.exportMasterData = async (req, res, next) => {
    try {
        const { justification } = req.body;
        // master export is sometimes triggered via GET link from dashboard, but should ideally be POST with justification
        // If it's a GET request, we might not have a body. In a real SaaS, this would be a POST.
        
        // Log the high-privilege action
        await Log.create({
            user_id: req.user._id,
            user_role: 'ADMIN',
            action: 'EXPORT_MASTER_DATA',
            description: 'Initiated full system data export (streamed)',
            metadata: { justification: justification || 'Full system download triggered' }
        });

        const settings = await GlobalSettings.findOne({ singletonId: 'tnu_settings' });

        // Set headers for file download
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=TNU_Master_Export_${new Date().toISOString().split('T')[0]}.json`);

        // --- Helper: stream an entire collection as a JSON array ---
        // Writes documents one-by-one from a Mongoose cursor, keeping memory flat.
        const streamCollection = async (cursor) => {
            let first = true;
            res.write('[');
            for await (const doc of cursor) {
                if (!first) res.write(',');
                res.write(JSON.stringify(doc));
                first = false;
            }
            res.write(']');
        };

        // Begin writing the JSON envelope
        res.write('{');
        res.write(`"exportTimestamp":"${new Date().toISOString()}",`);
        res.write(`"exportedBy":${JSON.stringify(req.user.email)},`);
        res.write(`"platformName":${JSON.stringify(settings?.institutionName || 'TNU')},`);
        res.write('"data":{');

        // Stream each collection using cursors (constant memory usage)
        res.write('"students":');
        await streamCollection(Student.find().select('-password').lean().cursor());

        res.write(',"recruiters":');
        await streamCollection(Recruiter.find().select('-password').lean().cursor());

        res.write(',"jobs":');
        await streamCollection(Job.find().lean().cursor());

        res.write(',"applications":');
        await streamCollection(Application.find().lean().cursor());

        // Close the JSON envelope
        res.write('}}');
        res.end();
    } catch (err) {
        logger.error(`Master export error: ${err.message}`);
        // If headers haven't been sent yet, send an error response
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: 'Failed to generate master data export.' });
        } else {
            // Headers already sent (mid-stream failure) — destroy the connection
            res.destroy();
        }
    }
};

/**
 * @desc    Get system logs
 * @route   GET /api/v1/admin/logs
 * @access  Private/Admin
 */
exports.getLogs = async (req, res, next) => {
    try {
        res.status(200).json(res.advancedResults);
    } catch (err) {
        next(err);
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
exports.generateApiKey = async (req, res, next) => {
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
        next(err);
    }
};

/**
 * @desc    Get all active API keys for this admin
 * @route   GET /api/v1/admin/api-keys
 * @access  Private/Admin
 */
exports.listApiKeys = async (req, res, next) => {
    try {
        const admin = await Admin.findById(req.user._id).select('+api_keys');
        const keys = admin.api_keys.map(k => ({
            _id: k._id,
            name: k.name,
            createdAt: k.createdAt
        }));

        res.status(200).json({ success: true, count: keys.length, data: keys });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Revoke/Delete an API key
 * @route   DELETE /api/v1/admin/api-keys/:id
 * @access  Private/Admin
 */
exports.revokeApiKey = async (req, res, next) => {
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
        next(err);
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
exports.bulkOperations = async (req, res, next) => {
    try {
        const { type, duplicateStrategy = 'SKIP' } = req.body;
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a CSV or Excel file' });
        }

        let records = [];
        const buffer = req.file.buffer;

        // ── Step 1: Parse Data based on Mimetype ─────────────────────────────
        if (req.file.mimetype === 'text/csv' || req.file.mimetype === 'application/vnd.ms-excel') {
            const stream = require('streamifier').createReadStream(buffer);
            const csvParser = require('fast-csv');

            records = await new Promise((resolve, reject) => {
                const rows = [];
                stream.pipe(csvParser.parse({ headers: true, ignoreEmpty: true, ltrim: true, rtrim: true }))
                    .on('data', row => rows.push(row))
                    .on('end', () => resolve(rows))
                    .on('error', reject);
            });
        } else if (
            req.file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            req.file.originalname.endsWith('.xlsx')
        ) {
            const XLSX = require('xlsx');
            const workbook = XLSX.read(buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            records = XLSX.utils.sheet_to_json(worksheet);
        } else {
            return res.status(400).json({ success: false, message: 'Unsupported file format. Please use .csv or .xlsx' });
        }

        if (records.length === 0) {
            return res.status(400).json({ success: false, message: 'The uploaded file contains no data rows.' });
        }

        const { bulkQueue } = require('../utils/bulkQueue');
        const job = await bulkQueue.add(`bulk-${type}-${Date.now()}`, {
            type,
            records,
            options: { duplicateStrategy }
        });

        await Log.create({
            user_id: req.user._id,
            user_role: 'ADMIN',
            action: 'BULK_IMPORT_START',
            description: `Started bulk ${type} import (${records.length} records) from ${req.file.originalname}`
        });

        res.status(202).json({
            success: true,
            jobId: job.id,
            recordCount: records.length
        });

    } catch (err) {
        logger.error(`Bulk Operations Error: ${err.message}`);
        next(err);
    }
};

/**
 * @desc    Get status of an active bulk worker
 * @route   GET /api/v1/admin/bulk/:jobId
 * @access  Private/Admin
 */
exports.getBulkJobStatus = async (req, res, next) => {
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
        next(err);
    }
};


/**
 * @desc    Get system-wide global settings
 * @route   GET /api/v1/admin/settings
 * @access  Private/Admin
 */
exports.getSettings = async (req, res, next) => {
    try {
        let settings = await GlobalSettings.findOne({ singletonId: 'tnu_settings' });

        if (!settings) {
            settings = await GlobalSettings.create({ singletonId: 'tnu_settings' });
        }

        res.status(200).json({ success: true, data: settings });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Update system-wide global settings
 * @route   PUT /api/v1/admin/settings
 * @access  Private/Admin
 */
exports.updateSettings = async (req, res, next) => {
    try {
        const oldSettings = await GlobalSettings.findOne({ singletonId: 'tnu_settings' });

        const settings = await GlobalSettings.findOneAndUpdate(
            { singletonId: 'tnu_settings' },
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
                ip_address: req.ip,
                metadata: {
                    old_value: oldSettings,
                    new_value: settings
                }
            });
        }

        res.status(200).json({ success: true, data: settings });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get administrative audit logs
 * @route   GET /api/v1/admin/audit-logs
 * @access  Private/Admin
 */
exports.getAuditLogs = async (req, res, next) => {
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
        next(err);
    }
};


/**
 * @desc    Upload Institution Logo to Cloudinary and update Settings
 * @route   POST /api/v1/admin/settings/logo
 * @access  Private/Admin
 */
const { uploadToCloudinary } = require('../utils/cloudinary');

exports.uploadLogo = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please provide an image file' });
        }

        // Upload to Cloudinary, folder: "branding"
        const result = await uploadToCloudinary(req.file.buffer, 'branding', 'image');

        // Update the GlobalSettings with the new logo URL
        const settings = await GlobalSettings.findOneAndUpdate(
            { singletonId: 'tnu_settings' },
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
exports.uploadFavicon = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please provide an icon or image file' });
        }

        // Upload to Cloudinary, folder: "branding"
        const result = await uploadToCloudinary(req.file.buffer, 'branding', 'image');

        // Update the GlobalSettings with the new favicon URL
        const settings = await GlobalSettings.findOneAndUpdate(
            { singletonId: 'tnu_settings' },
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
            institutionName: 'TNU University',
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
exports.getJobs = async (req, res, next) => {
    try {
        res.status(200).json(res.advancedResults);
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Update job approval and featured status
 * @route   PUT /api/v1/admin/jobs/:id/status
 * @access  Private/Admin
 */
exports.updateJobStatus = async (req, res, next) => {
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

        // ── Automation Trigger ──────────────────────────────────────────
        if (is_approved) {
            const { notifyNewJobAlerts } = require('../services/automationService');
            // Run in background (don't await to avoid blocking the response)
            setImmediate(() => notifyNewJobAlerts(job));
        }

        res.status(200).json({ success: true, data: job });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get all applications for university-wide Kanban
 * @route   GET /api/v1/admin/applications
 * @access  Private/Admin
 */
exports.getApplications = async (req, res, next) => {
    try {
        res.status(200).json(res.advancedResults);
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Update application status (Kanban drag & drop)
 * @route   PUT /api/v1/admin/applications/:id/status
 * @access  Private/Admin
 */
exports.updateApplicationStatus = async (req, res, next) => {
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
        next(err);
    }
};

/**
 * @desc    Get ranked candidate matches for a specific job (Rule-based)
 * @route   GET /api/v1/admin/jobs/:id/matches
 * @access  Private/Admin
 */
exports.getJobMatches = async (req, res, next) => {
    try {
        const Job = require('../models/Job');
        const Student = require('../models/Student');

        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // 1. Fetch eligible students
        const students = await Student.find({ status: 'APPROVED' })
            .select('name email branch studentProfile profile_image_url');

        // 2. Simple Heuristic Matching (Non-AI)
        const jobSkills = job.skills_required.map(s => s.toLowerCase());
        
        const matchedCandidates = students.map(student => {
            const studentSkills = (student.skills || []).map(s => s.toLowerCase());
            
            // Skill Match Count
            const overlap = studentSkills.filter(s => jobSkills.includes(s)).length;
            const skillScore = (overlap / Math.max(jobSkills.length, 1)) * 100;
 
            // CGPA Factor (normalized to 100)
            const cgpaScore = (student.cgpa || 0) * 10;
 
            // Branch Match
            const branchMatch = job.eligible_branch === student.branch;
            const branchScore = branchMatch ? 100 : 0;
 
            // Simple weighted average: 60% Skills, 30% CGPA, 10% Branch
            const finalScore = (skillScore * 0.6) + (cgpaScore * 0.3) + (branchScore * 0.1);
 
            return {
                student: {
                    _id: student._id,
                    name: student.name,
                    email: student.email,
                    branch: student.branch,
                    cgpa: student.cgpa,
                },
                matchScore: Math.round(finalScore),
                matchReason: `Skill Overlap: ${overlap}/${jobSkills.length} matches. ${branchMatch ? 'Branch matches' : 'Branch mismatch'}.`
            };
        })
        .filter(c => c.matchScore > 30) // Minimum threshold
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 50); // Limit results

        res.status(200).json({
            success: true,
            count: matchedCandidates.length,
            data: matchedCandidates
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get the latest pulse events for the Live Command Center
 * @route   GET /api/v1/admin/pulse
 * @access  Private/Admin
 */
exports.getLatestPulse = async (req, res, next) => {
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
        next(err);
    }
};

/**
 * @desc    Get all system-wide interviews for the Unified Calendar
 * @route   GET /api/v1/admin/interviews
 * @access  Private/Admin
 */
exports.getAllInterviews = async (req, res, next) => {
    try {
        const Interview = require('../models/Interview');

        // We use advancedResults if possible, otherwise manual fetch
        // (Assuming advancedResults middleware is attached in the route mapping)
        res.status(200).json(res.advancedResults);
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get all email outreach campaigns
 * @route   GET /api/v1/admin/campaigns
 * @access  Private/Admin
 */
exports.getCampaigns = async (req, res, next) => {
    try {
        const Campaign = require('../models/Campaign');
        res.status(200).json(res.advancedResults);
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Create and send a new mass email campaign
 * @route   POST /api/v1/admin/campaigns
 * @access  Private/Admin
 */
exports.createCampaign = async (req, res, next) => {
    try {
        const { title, subject, target_audience, target_filters, channels, html_content, scheduled_for } = req.body;
        const Campaign = require('../models/Campaign');
        const Student = require('../models/Student');
        const Recruiter = require('../models/Recruiter');

        // 1. Build Dynamic Filter Query using specialized service
        const { query, targetModel } = await campaignService.buildTargetQuery(target_audience, target_filters);

        const recipientsCount = await targetModel.countDocuments(query);

        if (recipientsCount === 0) {
            return res.status(400).json({ success: false, message: 'No recipients found for the selected cohort.' });
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
            status: scheduled_for ? 'SCHEDULED' : 'SENDING',
            total_recipients: recipients.length,
            sent_count: 0,
            scheduled_for,
            created_by: req.user._id
        });

        // 3. If scheduled for later, we stop here
        if (scheduled_for) {
            return res.status(201).json({
                success: true,
                message: `Campaign scheduled for ${new Date(scheduled_for).toLocaleString()} to ${recipientsCount} recipients.`,
                data: campaign
            });
        }

        // 4. Dispatch Deliveries (for immediate campaigns)
        // Background hand-off to specialized service
        setImmediate(async () => {
            await campaignService.dispatchCampaign(campaign);
        });

        res.status(202).json({
            success: true,
            data: campaign,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get counts of obsolete data for maintenance
 * @route   GET /api/v1/admin/system-health
 * @access  Private/Admin
 */
exports.getSystemHealth = async (req, res, next) => {
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
        next(err);
    }
};

/**
 * @desc    Purge obsolete platform data
 * @route   POST /api/v1/admin/purge
 * @access  Private/Admin
 */
exports.purgeData = async (req, res, next) => {
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
        next(err);
    }
};

/**
 * @desc    Get all active sessions for monitoring
 * @route   GET /api/v1/admin/sessions
 * @access  Private/Admin
 */
exports.getAllSessions = async (req, res, next) => {
    try {
        const sessions = await Session.find()
            .sort({ created_at: -1 })
            .limit(200)
            .populate('user_id', 'name email contact_person company_name');
        
        res.status(200).json({
            success: true,
            count: sessions.length,
            data: sessions
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Revoke a specific session
 * @route   DELETE /api/v1/admin/sessions/:id
 * @access  Private/Admin
 */
exports.revokeSession = async (req, res, next) => {
    try {
        const session = await Session.findByIdAndDelete(req.params.id);

        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        await Log.create({
            user_id: req.user._id,
            user_role: 'ADMIN',
            action: 'REVOKE_SESSION',
            description: `Forcefully revoked session for user ${session.user_id} (${session.ip_address})`
        });

        res.status(200).json({
            success: true,
            message: 'Session revoked successfully'
        });
    } catch (err) {
        next(err);
    }
};


/**
 * @desc    Setup 2FA for Admin
 * @route   POST /api/v1/admin/2fa/setup
 * @access  Private/Admin
 */
exports.setup2FA = async (req, res, next) => {
    try {
        const admin = await Admin.findById(req.user._id);
        const { secret, qrCodeUrl } = require('../utils/totp').generateSecret(admin.email);

        // Store temp secret
        admin.twofa_secret = secret;
        await admin.save();

        res.status(200).json({
            success: true,
            qrCodeUrl,
            secret
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Verify and enable 2FA Setup
 * @route   POST /api/v1/admin/2fa/verify
 * @access  Private/Admin
 */
exports.verify2FASetup = async (req, res, next) => {
    try {
        const { token } = req.body;
        const admin = await Admin.findById(req.user._id);

        const isValid = require('../utils/totp').verifyToken(admin.twofa_secret, token);

        if (!isValid) {
            return res.status(400).json({ success: false, message: 'Invalid verification code' });
        }

        admin.twofa_enabled = true;
        await admin.save();

        await Log.create({
            user_id: req.user._id,
            user_role: 'ADMIN',
            action: 'ENABLE_2FA',
            description: 'Admin enabled Two-Factor Authentication'
        });

        res.status(200).json({
            success: true,
            message: '2FA enabled successfully'
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Disable 2FA
 * @route   POST /api/v1/admin/2fa/disable
 * @access  Private/Admin
 */
exports.disable2FA = async (req, res, next) => {
    try {
        const admin = await Admin.findById(req.user._id);
        admin.twofa_enabled = false;
        admin.twofa_secret = undefined;
        await admin.save();

        await Log.create({
            user_id: req.user._id,
            user_role: 'ADMIN',
            action: 'DISABLE_2FA',
            description: 'Admin disabled Two-Factor Authentication'
        });

        res.status(200).json({
            success: true,
            message: '2FA disabled successfully'
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Update Admin Branch (for DEPARTMENT_HEAD)
 * @route   PUT /api/v1/admin/rbac/admins/:id/branch
 * @access  Private/Admin (Super Admin)
 */
exports.updateAdminBranch = async (req, res, next) => {
    try {
        const { branch } = req.body;
        const admin = await Admin.findById(req.params.id);

        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin not found' });
        }

        admin.branch = branch;
        await admin.save();

        res.status(200).json({
            success: true,
            message: 'Branch updated successfully',
            data: admin
        });
    } catch (err) {
        next(err);
    }
};
