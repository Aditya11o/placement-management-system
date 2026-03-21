const Application = require('../models/Application');
const Recruiter = require('../models/Recruiter');
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


exports.applyToJob = async (req, res, next) => {
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

        // ── Placement Policy Enforcement ────────────────────────────────────
        const settings = await GlobalSettings.findOne({ singletonId: 'tnu_settings' });
        if (settings) {
            // Block same-company duplicate applications
            if (settings.blockMultipleApplicationsSameCompany) {
                const sameCompanyApp = await Application.findOne({
                    student_id: req.user._id,
                    job_id: { $in: await Job.find({ company_name: job.company_name }).select('_id') }
                });
                if (sameCompanyApp) {
                    return res.status(400).json({ success: false, message: 'You have already applied to this company through another role.' });
                }
            }

            // Max offers policy (skip if dream upgrade eligible)
            if (settings.maxOffersPerStudent > 0) {
                const acceptedOffers = await Application.countDocuments({
                    student_id: req.user._id,
                    status: { $in: ['SELECTED', 'OFFER_ACCEPTED'] }
                });
                if (acceptedOffers >= settings.maxOffersPerStudent) {
                    // Check dream upgrade eligibility
                    const currentBest = await Application.findOne({
                        student_id: req.user._id,
                        status: { $in: ['SELECTED', 'OFFER_ACCEPTED'] }
                    }).populate('job_id', 'package_lpa');

                    const currentPackage = currentBest?.job_id?.package_lpa || 0;
                    if (job.package_lpa <= settings.dreamUpgradeThresholdLPA || job.package_lpa <= currentPackage) {
                        return res.status(400).json({
                            success: false,
                            message: `You already have ${acceptedOffers} offer(s). New applications require a package above ₹${settings.dreamUpgradeThresholdLPA} LPA (Dream Upgrade Policy).`
                        });
                    }
                }
            }
        }
        // ────────────────────────────────────────────────────────────────────

        const application = await Application.create({ 
            student_id: req.user._id, 
            job_id,
            branch: req.user.branch 
        });

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
        next(err);
    }
};

exports.getRecruiterApplications = async (req, res, next) => {
    try {
        const recruiter = await Recruiter.findById(req.user._id);
        if (!recruiter.company_id) {
            return res.status(200).json({ success: true, data: [] });
        }

        // Find all jobs in this company
        const jobs = await Job.find({ company_id: recruiter.company_id }).select('_id');
        const jobIds = jobs.map(job => job._id);

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;

        const total = await Application.countDocuments({ job_id: { $in: jobIds } });
        const applications = await Application.find({ job_id: { $in: jobIds } })
            .populate({
                path: 'job_id',
                select: 'title company_name status deadline company_id'
            })
            .populate({
                path: 'student_id',
                select: 'name email phone branch graduation_year cgpa marks_10th marks_12th backlogs_active skills profile_image_url resume_versions activeResume resume_url'
            })
            .sort('-created_at')
            .skip(startIndex)
            .limit(limit)
            .lean();

        res.status(200).json({
            success: true,
            count: applications.length,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            },
            data: applications
        });
    } catch (err) {
        next(err);
    }
};

exports.getMyApplications = async (req, res, next) => {
    try {
        const applications = await Application.find({ student_id: req.user._id })
            .populate('job_id', 'title company_name status deadline');
        res.status(200).json({ success: true, count: applications.length, data: applications });
    } catch (err) {
        next(err);
    }
};

exports.getJobApplicants = async (req, res, next) => {
    try {
        const recruiter = await Recruiter.findById(req.user._id);
        const { job_id } = req.params;
        const job = await Job.findById(job_id);

        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

        if (job.company_id.toString() !== recruiter.company_id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to view applicants for this job' });
        }

        const applications = await Application.find({ job_id })
            .populate('student_id', 'name email branch cgpa phone resume_url')
            .sort('-applied_at');
        
        res.status(200).json({ success: true, count: applications.length, data: applications });
    } catch (err) {
        next(err);
    }
};

exports.updateApplicationStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const validStatuses = ['SUBMITTED', 'REVIEWED', 'SHORTLISTED', 'SELECTED', 'REJECTED'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const recruiter = await Recruiter.findById(req.user._id);
        let application = await Application.findById(req.params.id)
            .populate('job_id')
            .populate('student_id', 'name email');

        if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

        if (application.job_id.company_id.toString() !== recruiter.company_id.toString()) {
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
                        offer_letter_generated_at: new Date(),
                        offer_issued_at: new Date(),
                        offer_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
                    });
                }
            }).catch(() => { }); // already logged inside the service

            // 🔌 Check for Tier-1 Placement Celebration Webhook
            try {
                const settings = await GlobalSettings.findOne({ singletonId: 'tnu_settings' });
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

        // 🚀 Dispatch across all channels: persistent DB, WebSocket, Email (respecting frequency), Webhooks, and SMS if critical
        const notifType = status === 'SELECTED' ? 'SUCCESS' : status === 'REJECTED' ? 'ERROR' : 'INFO';
        await dispatchToUser({
            recipientId: application.student_id._id,
            recipientModel: 'Student',
            eventName: 'application_status_update',
            title: `Application Update: ${application.job_id.company_name}`,
            message: `Your application for "${application.job_id.title}" is now: ${status}.`,
            type: notifType,
            link: `/applications/${application._id}`,
            emailOptions: {
                subject: `Application Status Updated: ${application.job_id.title}`
            },
            metadata: {
                isCritical: status === 'SELECTED' || status === 'SHORTLISTED'
            }
        });

        // Redundant manual webhook logic removed - handled by dispatchToUser

        // Notification already persisted + pushed via dispatchToUser above

        await Log.create({
            user_id: req.user._id,
            user_role: 'RECRUITER',
            action: 'UPDATE_APP_STATUS',
            target_id: application._id,
            description: `Updated status to ${status}`
        });

        // Real-time Collaboration: Notify all admins
        dispatchToRole('ADMIN', 'application:status_update', {
            id: application._id,
            status,
            studentName: application.student_id.name,
            companyName: application.job_id.company_name,
            updatedBy: req.user._id
        });

        res.json({ success: true, data: application });
    } catch (err) {
        console.error("APP_CONTROLLER_ERROR:", err.stack || err.message || err);
        next(err);
    }
};

exports.addScorecard = async (req, res, next) => {
    try {
        const { communication, technical, culture, overall, comments, round_name, recommendation } = req.body;
        
        // Basic validation
        if (![communication, technical, culture, overall].every(val => val >= 1 && val <= 5)) {
            return res.status(400).json({ success: false, message: 'Ratings must be between 1 and 5' });
        }

        const recruiter = await Recruiter.findById(req.user._id);
        const application = await Application.findById(req.params.id).populate('job_id');
        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        // Restrict to the recruiter who belongs to the same company
        if (application.job_id.company_id.toString() !== recruiter.company_id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to scorecard this application' });
        }

        const newScorecard = {
            reviewer_id: req.user._id,
            reviewer_name: req.user.name,
            round_name: round_name || 'General',
            communication,
            technical,
            culture,
            overall,
            recommendation: recommendation || 'MAYBE',
            comments: comments || ''
        };

        application.scorecards.unshift(newScorecard);
        await application.save();

        await Log.create({
            user_id: req.user._id,
            user_role: 'RECRUITER',
            action: 'SUBMIT_SCORECARD',
            target_id: application._id,
            description: `Submitted scorecard with overall rating ${overall}/5`
        });

        res.status(201).json({ success: true, data: application });
    } catch (err) {
        logger.error(`Add Scorecard Error: ${err.message}`);
        res.status(500).json({ success: false, message: 'Server Error adding scorecard' });
    }
};

/**
 * @desc    Accept a job offer
 * @route   POST /api/v1/applications/:id/accept
 * @access  Private (Student Only)
 */
exports.acceptOffer = async (req, res, next) => {
    try {
        const application = await Application.findById(req.params.id)
            .populate('job_id')
            .populate('student_id');

        if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

        // Authorization check
        if (application.student_id._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        if (application.status !== 'SELECTED') {
            return res.status(400).json({ success: false, message: 'Offer not found or already processed' });
        }

        // Update application
        application.status = 'OFFER_ACCEPTED';
        await application.save();

        // Update student placement status
        const Student = require('../models/Student');
        await Student.findByIdAndUpdate(req.user._id, {
            is_placed: true,
            placement_details: {
                job_id: application.job_id._id,
                company_name: application.job_id.company_name,
                package_lpa: application.job_id.package_lpa,
                placed_at: new Date()
            }
        });

        // Notify recruiter
        await dispatchToUser({
            recipientId: application.job_id.recruiter_id,
            recipientModel: 'Recruiter',
            eventName: 'offer_accepted',
            title: `Offer Accepted! 🎉`,
            message: `${application.student_id.name} has accepted the offer for "${application.job_id.title}".`,
            type: 'SUCCESS',
            link: `/jobs/${application.job_id._id}/applicants`
        });

        res.json({ success: true, message: 'Congratulations! You have accepted the offer.' });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Decline a job offer
 * @route   POST /api/v1/applications/:id/decline
 * @access  Private (Student Only)
 */
exports.declineOffer = async (req, res, next) => {
    try {
        const application = await Application.findById(req.params.id)
            .populate('job_id')
            .populate('student_id');

        if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

        if (application.student_id._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        if (application.status !== 'SELECTED') {
            return res.status(400).json({ success: false, message: 'Offer not found or already processed' });
        }

        application.status = 'OFFER_DECLINED';
        await application.save();

        // Notify recruiter
        await dispatchToUser({
            recipientId: application.job_id.recruiter_id,
            recipientModel: 'Recruiter',
            eventName: 'offer_declined',
            title: `Offer Declined`,
            message: `${application.student_id.name} has declined the offer for "${application.job_id.title}".`,
            type: 'ERROR',
            link: `/jobs/${application.job_id._id}/applicants`
        });

        res.json({ success: true, message: 'You have declined the offer.' });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Update application journal (notes and checklists)
 * @route   PUT /api/v1/applications/:id/journal
 * @access  Private (Student Only)
 */
exports.updateApplicationJournal = async (req, res, next) => {
    try {
        const { student_notes, checklists } = req.body;
        
        const application = await Application.findById(req.params.id);

        if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

        // Authorization check
        if (application.student_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        if (student_notes !== undefined) application.student_notes = student_notes;
        if (checklists !== undefined) application.checklists = checklists;

        await application.save();

        res.json({ success: true, data: application });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Send bulk email to selected candidates
 * @route   POST /api/v1/applications/bulk-email
 * @access  Private (Recruiter Only)
 */
exports.bulkEmailCandidates = async (req, res, next) => {
    try {
        const { applicationIds, subject, body: emailBody, templateId } = req.body;

        if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
            return res.status(400).json({ success: false, message: 'Please provide an array of application IDs' });
        }

        if (applicationIds.length > 100) {
            return res.status(400).json({ success: false, message: 'Maximum 100 candidates per batch' });
        }

        if (!subject || !emailBody) {
            return res.status(400).json({ success: false, message: 'Email subject and body are required' });
        }

        const recruiter = await Recruiter.findById(req.user._id);
        const applications = await Application.find({
            _id: { $in: applicationIds }
        })
            .populate('student_id', 'name email')
            .populate('job_id', 'company_id company_name title');

        // Verify all applications belong to this recruiter's company
        const unauthorized = applications.filter(
            app => app.job_id.company_id.toString() !== recruiter.company_id.toString()
        );
        if (unauthorized.length > 0) {
            return res.status(403).json({ success: false, message: 'Some applications do not belong to your company' });
        }

        // Queue emails
        let queued = 0;
        for (const app of applications) {
            if (app.student_id?.email) {
                await emailQueue.add('bulk-recruiter-email', {
                    email: app.student_id.email,
                    subject,
                    template: 'generic',
                    context: {
                        name: app.student_id.name,
                        body: emailBody,
                        companyName: app.job_id.company_name,
                        jobTitle: app.job_id.title
                    }
                });
                queued++;
            }
        }

        await Log.create({
            user_id: req.user._id,
            user_role: 'RECRUITER',
            action: 'BULK_EMAIL',
            description: `Sent bulk email to ${queued} candidates. Subject: ${subject}`
        });

        res.json({
            success: true,
            message: `Email queued for ${queued} candidate(s).`,
            data: { queued, total: applicationIds.length }
        });
    } catch (err) {
        next(err);
    }
};
