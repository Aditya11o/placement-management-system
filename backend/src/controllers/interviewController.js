const Interview = require('../models/Interview');
const Application = require('../models/Application');
const Log = require('../models/Log');
const { emailQueue } = require('../utils/emailQueue');
const { dispatchToUser } = require('../services/notifyDispatcher');
const config = require('../config/config');
const logger = require('../utils/logger');

/**
 * @desc    Schedule a new interview
 * @route   POST /api/v1/interviews
 * @access  Private/Recruiter
 */
exports.scheduleInterview = async (req, res) => {
    try {
        const { application_id, scheduled_at, duration_minutes, type, location_type, location_details, notes } = req.body;

        const application = await Application.findById(application_id)
            .populate('job_id')
            .populate('student_id', 'name email');

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        if (application.job_id.recruiter_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to schedule for this application' });
        }

        // Must be shortlisted to be interviewed (optional but standard compliance rule)
        if (application.status !== 'SHORTLISTED') {
            return res.status(400).json({ success: false, message: 'Student must be SHORTLISTED first' });
        }

        const scheduledAt = new Date(scheduled_at);
        const duration = duration_minutes || 45;
        const endTime = new Date(scheduledAt.getTime() + duration * 60000);
        
        // Concurrency Check with 15-min buffer
        const bufferMs = 15 * 60000;
        const startTimeWithBuffer = new Date(scheduledAt.getTime() - bufferMs);
        const endTimeWithBuffer = new Date(endTime.getTime() + bufferMs);

        const overlapping = await Interview.findOne({
            $or: [
                { recruiter_id: req.user._id },
                { student_id: application.student_id._id }
            ],
            status: { $in: ['PROPOSED', 'CONFIRMED'] },
            scheduled_at: { $lt: endTimeWithBuffer },
            $expr: {
                $gt: [
                    { $add: ["$scheduled_at", { $multiply: ["$duration_minutes", 60000] }, bufferMs] },
                    startTimeWithBuffer
                ]
            }
        });

        if (overlapping) {
            const conflictSubject = overlapping.recruiter_id.toString() === req.user._id.toString() ? 'Recruiter' : 'Student';
            return res.status(409).json({ 
                success: false, 
                message: `${conflictSubject} already has an interview scheduled near this time Slot (including 15m buffer).` 
            });
        }

        const interview = await Interview.create({
            application_id,
            student_id: application.student_id,
            job_id: application.job_id._id,
            recruiter_id: req.user._id,
            scheduled_at,
            duration_minutes: duration_minutes || 45,
            type: type || 'Technical',
            location_type,
            location_details,
            notes
        });

        // 🚀 Dispatch across all channels: persistent DB, WebSocket, Email, Webhooks, and SMS (Critical)
        await dispatchToUser({
            recipientId: application.student_id._id,
            recipientModel: 'Student',
            eventName: 'interview_scheduled',
            title: 'Interview Scheduled',
            message: `You have been scheduled for an interview for ${application.job_id.title} at ${application.job_id.company_name}.`,
            type: 'INFO',
            link: `/interviews/${interview._id}`,
            metadata: {
                isCritical: true // Interviews are time-sensitive
            },
            emailOptions: {
                subject: `Interview Scheduled for ${application.job_id.title}`,
                template: 'interview',
                context: {
                    jobTitle: application.job_id.title,
                    company: application.job_id.company_name,
                    date: new Date(scheduled_at).toLocaleString(),
                    type: location_type,
                    location: location_details
                }
            }
        });

        await Log.create({
            user_id: req.user._id, user_role: 'RECRUITER',
            action: 'SCHEDULE_INTERVIEW', target_id: interview._id
        });

        res.status(201).json({ success: true, data: interview });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Reschedule an interview
 * @route   PATCH /api/v1/interviews/:id/reschedule
 * @access  Private/Recruiter
 */
exports.rescheduleInterview = async (req, res) => {
    try {
        const { scheduled_at, duration_minutes, type, reason } = req.body;

        let interview = await Interview.findById(req.params.id)
            .populate('job_id', 'title company_name')
            .populate('student_id', 'name email');

        if (!interview) {
            return res.status(404).json({ success: false, message: 'Interview not found' });
        }

        if (interview.recruiter_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to reschedule this interview' });
        }

        // Keep status as SCHEDULED/PROPOSED but update time
        interview.scheduled_at = scheduled_at || interview.scheduled_at;
        if (duration_minutes) interview.duration_minutes = duration_minutes;
        if (type) interview.type = type;
        if (interview.status !== 'CONFIRMED' && interview.status !== 'COMPLETED' && interview.status !== 'CANCELED') {
             // reset to proposed if it was rejected previously to trigger a new cycle
             interview.status = 'PROPOSED';
        }
        
        await interview.save();

        // 🚀 Dispatch across channels with 'reason' for reschedule
        await dispatchToUser({
            recipientId: interview.student_id._id,
            recipientModel: 'Student',
            eventName: 'interview_rescheduled',
            title: 'Interview Rescheduled',
            message: `Your interview for ${interview.job_id.title} has been rescheduled to ${new Date(interview.scheduled_at).toLocaleString()}.`,
            type: 'INFO',
            link: `/interviews/${interview._id}`,
            emailOptions: {
                subject: `Update: Interview Rescheduled for ${interview.job_id.title}`,
                template: 'interview',  // We can reuse the interview template
                context: {
                    jobTitle: interview.job_id.title,
                    company: interview.job_id.company_name,
                    date: new Date(interview.scheduled_at).toLocaleString(),
                    type: interview.location_type,
                    location: interview.location_details,
                    notes: reason ? `Message from recruiter: ${reason}` : ''
                }
            }
        });

        await Log.create({
            user_id: req.user._id, user_role: 'RECRUITER',
            action: 'RESCHEDULE_INTERVIEW', target_id: interview._id
        });

        res.status(200).json({ success: true, data: interview });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Student responds to interview (CONFIRM/REJECT)
 * @route   PUT /api/v1/interviews/:id/respond
 * @access  Private/Student
 */
exports.respondToInterview = async (req, res) => {
    try {
        const { status } = req.body;

        if (!['CONFIRMED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid response status' });
        }

        let interview = await Interview.findById(req.params.id)
            .populate('job_id')
            .populate('student_id', 'name');

        if (!interview) {
            return res.status(404).json({ success: false, message: 'Interview not found' });
        }

        if (interview.student_id._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized for this interview' });
        }

        if (interview.status !== 'PROPOSED') {
            return res.status(400).json({ success: false, message: `Interview is already ${interview.status}` });
        }

        interview.status = status;
        await interview.save();

        const studentName = interview.student_id.name;

        // 🚀 Persist notification + push live event to the recruiter
        await dispatchToUser({
            recipientId: interview.recruiter_id,
            recipientModel: 'Recruiter',
            eventName: 'interview_scheduled',
            title: `Interview ${status}: ${studentName}`,
            message: `${studentName} has ${status.toLowerCase()} the interview for ${interview.job_id.title}.`,
            type: status === 'REJECTED' ? 'WARNING' : 'SUCCESS',
            link: `/interviews/${interview._id}`
        });

        res.status(200).json({ success: true, data: interview });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Recruiter updates interview status (COMPLETED/CANCELED)
 * @route   PUT /api/v1/interviews/:id/status
 * @access  Private/Recruiter
 */
exports.updateInterviewStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!['COMPLETED', 'CANCELED'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status update' });
        }

        let interview = await Interview.findById(req.params.id);

        if (!interview) {
            return res.status(404).json({ success: false, message: 'Interview not found' });
        }

        if (interview.recruiter_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        interview.status = status;
        await interview.save();

        // 🚀 Notify student of cancellation with a live push
        if (status === 'CANCELED') {
            await dispatchToUser({
                recipientId: interview.student_id,
                recipientModel: 'Student',
                eventName: 'interview_canceled',
                title: 'Interview Canceled',
                message: 'Your upcoming interview has been canceled by the recruiter.',
                type: 'ERROR',
                link: `/interviews/${interview._id}`
            });
        }

        res.status(200).json({ success: true, data: interview });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Get all interviews for current user (handles both Recruiter and Student)
 * @route   GET /api/v1/interviews
 * @access  Private
 */
exports.getMyInterviews = async (req, res) => {
    try {
        let filter = {};
        if (req.user.role === 'STUDENT') {
            filter = { student_id: req.user._id };
        } else if (req.user.role === 'RECRUITER') {
            filter = { recruiter_id: req.user._id };
        } else {
            return res.status(403).json({ success: false, message: 'Role not applicable for interviews' });
        }

        // Get past or upcoming
        if (req.query.upcoming === 'true') {
            filter.scheduled_at = { $gte: new Date() };
        }

        const interviews = await Interview.find(filter)
            .sort({ scheduled_at: 1 })
            .populate('job_id', 'title company_name')
            .populate('student_id', 'name email');

        res.status(200).json({ success: true, count: interviews.length, data: interviews });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
