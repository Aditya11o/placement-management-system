const Application = require('../models/Application');
const Job = require('../models/Job');
const Log = require('../models/Log');
const { emailQueue } = require('../utils/emailQueue');
const { dispatchToUser, dispatchToRole } = require('../services/notifyDispatcher');
const { generateOfferLetter } = require('../services/offerLetterService');
const { checkEligibility } = require('../services/eligibilityService');
const { sendSystemAlert } = require('../utils/webhookHelper');
const GlobalSettings = require('../models/GlobalSettings');
const config = require('../config/config');
const logger = require('../utils/logger');

exports.applyToJob = async (req, res) => {
    try {
        const { job_id } = req.body;
        const job = await Job.findById(job_id);

        if (!job || job.status !== 'ACTIVE') {
            return res.status(400).json({ success: false, message: 'Job not available' });
        }

        // Prevent duplicate applications
        const existingApp = await Application.findOne({ student_id: req.user._id, job_id });
        if (existingApp) {
            return res.status(400).json({ success: false, message: 'Already applied for this job' });
        }

        // Server-side strict validation using Eligibility Engine
        const eligibility = checkEligibility(req.user, job);
        if (!eligibility.isEligible) {
            return res.status(400).json({
                success: false,
                message: 'You are not eligible for this job criteria',
                reasons: eligibility.reasons
            });
        }

        const application = await Application.create({ student_id: req.user._id, job_id });

        await Log.create({
            user_id: req.user._id,
            user_role: 'STUDENT',
            action: 'APPLY_JOB',
            target_id: application._id
        });

        // 🚀 Instantly notify the recruiter that a new application landed
        await dispatchToUser({
            recipientId: job.recruiter_id,
            recipientModel: 'Recruiter',
            eventName: 'new_application_received',
            title: `New Application: ${job.title}`,
            message: `A new student has applied for "${job.title}". Review their profile now.`,
            type: 'INFO',
            link: `/jobs/${job._id}/applicants`
        });

        res.status(201).json({ success: true, data: application });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getRecruiterApplications = async (req, res, next) => {
    try {
        // Find all jobs posted by this recruiter
        const jobs = await Job.find({ recruiter_id: req.user._id }).select('_id');
        const jobIds = jobs.map(job => job._id);

        const applications = await Application.find({ job_id: { $in: jobIds } })
            .populate({
                path: 'job_id',
                select: 'title company_name status deadline'
            })
            .populate({
                path: 'student_id',
                select: 'name email phone branch graduation_year cgpa marks_10th marks_12th backlogs_active skills profile_image_url resume_versions activeResume resume_url'
            })
            .sort('-created_at');

        res.status(200).json({
            success: true,
            count: applications.length,
            data: applications
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getMyApplications = async (req, res, next) => {
    try {
        req.advancedFilter = { student_id: req.user._id };
        res.status(200).json(res.advancedResults);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getJobApplicants = async (req, res, next) => {
    try {
        const { job_id } = req.params;
        const job = await Job.findById(job_id);

        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

        if (job.recruiter_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to view applicants for this job' });
        }

        req.advancedFilter = { job_id };
        res.status(200).json(res.advancedResults);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['SUBMITTED', 'REVIEWED', 'SHORTLISTED', 'SELECTED', 'REJECTED'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        let application = await Application.findById(req.params.id)
            .populate('job_id')
            .populate('student_id', 'name email');

        if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

        if (application.job_id.recruiter_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this status' });
        }

        application.status = status;
        await application.save();

        // 📄 If student just got SELECTED → generate offer letter PDF (non-blocking)
        if (status === 'SELECTED') {
            // Fire-and-forget: errors inside are caught within the service
            generateOfferLetter({
                student: { name: application.student_id.name, email: application.student_id.email },
                job: application.job_id,
                applicationId: application._id.toString()
            }).then(async (pdfUrl) => {
                if (pdfUrl) {
                    // Save the Cloudinary URL back onto the application document
                    await Application.findByIdAndUpdate(application._id, {
                        offer_letter_url: pdfUrl,
                        offer_letter_generated_at: new Date()
                    });
                }
            }).catch(() => { }); // already logged inside the service

            // 🔌 Check for Tier-1 Placement Celebration Webhook
            try {
                const settings = await GlobalSettings.findOne({ singletonId: 'nexus_settings' });
                if (settings && settings.systemWebhookUrl) {
                    const threshold = settings.tier1SalaryThreshold || 1000000;
                    if (application.job_id.package_lpa >= threshold) {
                        await sendSystemAlert(
                            settings.systemWebhookUrl,
                            `🎉 **Tier-1 Placement Celebration!**`,
                            {
                                'Student': application.student_id.name,
                                'Company': application.job_id.company_name,
                                'Position': application.job_id.title,
                                'Package': `₹ ${application.job_id.package_lpa} LPA`,
                                'Status': 'Hired!'
                            }
                        );
                    }
                }
            } catch (webhookErr) {
                logger.warn(`Tier-1 webhook failed: ${webhookErr.message}`);
            }
        }

        // Dispatch Email Notification to Student asynchronously via queue
        try {
            await emailQueue.add('status-update-email', {
                email: application.student_id.email,
                subject: `Application Status Updated: ${application.job_id.title}`,
                template: 'alert',
                context: {
                    title: 'Application Update',
                    name: application.student_id.name,
                    message: `Your application for ${application.job_id.title} at ${application.job_id.company_name} has been updated to: ${status}`,
                    cta: {
                        text: 'View Application',
                        url: `${config.get('frontend_url')}/applications`
                    }
                }
            });
        } catch (emailError) {
            logger.warn(`Email queue failed for application update: ${emailError.message}`);
        }

        // 🚀 Dispatch persistent DB notification + instant WebSocket push in one call
        const notifType = status === 'SELECTED' ? 'SUCCESS' : status === 'REJECTED' ? 'ERROR' : 'INFO';
        await dispatchToUser({
            recipientId: application.student_id._id,
            recipientModel: 'Student',
            eventName: 'application_status_update',
            title: `Application Update: ${application.job_id.company_name}`,
            message: `Your application for "${application.job_id.title}" is now: ${status}.`,
            type: notifType,
            link: `/applications/${application._id}`
        });

        // 🔗 Dispatch Webhook Payload to ATS if configured
        try {
            // Need to fetch Recruiter to get Webhook URL since we only have Recruiter ID
            const Recruiter = require('../models/Recruiter');
            const recruiter = await Recruiter.findById(application.job_id.recruiter_id).select('webhook_url company_name');

            if (recruiter && recruiter.webhook_url) {
                const { webhookQueue } = require('../utils/webhookQueue');

                const payload = {
                    event: 'application_status_updated',
                    timestamp: new Date().toISOString(),
                    data: {
                        application_id: application._id,
                        job_id: application.job_id._id,
                        job_title: application.job_id.title,
                        student_name: application.student_id.name,
                        student_email: application.student_id.email,
                        new_status: status
                    }
                };

                await webhookQueue.add('dispatch-webhook', {
                    url: recruiter.webhook_url,
                    payload
                });
            }
        } catch (webhookErr) {
            logger.warn(`Webhook queuing failed: ${webhookErr.message}`);
        }

        // Notification already persisted + pushed via dispatchToUser above

        await Log.create({
            user_id: req.user._id,
            user_role: 'RECRUITER',
            action: 'UPDATE_APP_STATUS',
            target_id: application._id,
            description: `Updated status to ${status}`
        });

        res.json({ success: true, data: application });
    } catch (err) {
        console.error("APP_CONTROLLER_ERROR:", err.stack || err.message || err);
        res.status(500).json({ success: false, message: err.message });
    }
};
