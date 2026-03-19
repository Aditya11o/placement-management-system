const Interview = require('../models/Interview');
const Application = require('../models/Application');
const Log = require('../models/Log');
const { emailQueue } = require('../utils/emailQueue');
const { dispatchToUser } = require('../services/notifyDispatcher');
const googleCalendar = require('../utils/googleCalendar');
const Recruiter = require('../models/Recruiter');
const config = require('../config/config');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');
const InterviewSlot = require('../models/InterviewSlot');
const InterviewFeedback = require('../models/InterviewFeedback');

/**
 * @desc    Schedule a new interview
 * @route   POST /api/v1/interviews
 * @access  Private/Recruiter
 */
exports.scheduleInterview = async (req, res, next) => {
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
            notes,
            internal_room_id: location_type === 'VIRTUAL' ? uuidv4() : null
        });

        // 📅 Google Calendar Sync
        const recruiter = await Recruiter.findById(req.user._id).select('+calendar_tokens');
        if (recruiter.calendar_tokens) {
            try {
                const eventData = await googleCalendar.createEvent(recruiter.calendar_tokens, {
                    summary: `Interview: ${application.job_id.title} - ${application.student_id.name}`,
                    location: location_details,
                    description: `Interview for ${application.job_id.title} at ${application.job_id.company_name}.\nNotes: ${notes || 'N/A'}`,
                    start: scheduledAt.toISOString(),
                    end: endTime.toISOString(),
                    attendees: [
                        { email: application.student_id.email },
                        { email: recruiter.email }
                    ]
                });

                interview.calendar_provider = 'GOOGLE';
                interview.external_event_id = eventData.id;
                interview.meeting_link = eventData.hangoutLink || eventData.conferenceData?.entryPoints?.[0]?.uri || null;
                await interview.save();
            } catch (calErr) {
                logger.error(`Calendar Sync Failed: ${calErr.message}`);
                // Don't fail the whole request if calendar sync fails
            }
        }

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
                isCritical: true, // Interviews are time-sensitive
                meeting_link: interview.meeting_link
            },
            emailOptions: {
                subject: `Interview Scheduled for ${application.job_id.title}`,
                template: 'interview',
                context: {
                    jobTitle: application.job_id.title,
                    company: application.job_id.company_name,
                    date: new Date(scheduled_at).toLocaleString(),
                    type: location_type,
                    location: interview.meeting_link || location_details
                }
            }
        });

        // ⏰ Schedule 24h Reminder (BullMQ)
        const reminderTime = new Date(scheduledAt.getTime() - 24 * 60 * 60 * 1000);
        if (reminderTime > new Date()) {
            await emailQueue.add('interview-reminder', {
                email: application.student_id.email,
                subject: 'Reminder: Upcoming Interview Tomorrow',
                template: 'interview_reminder',
                context: {
                    name: application.student_id.name,
                    jobTitle: application.job_id.title,
                    company: application.job_id.company_name,
                    time: new Date(scheduled_at).toLocaleTimeString()
                }
            }, { delay: reminderTime.getTime() - Date.now() });
        }

        await Log.create({
            user_id: req.user._id, user_role: 'RECRUITER',
            action: 'SCHEDULE_INTERVIEW', target_id: interview._id
        });

        res.status(201).json({ success: true, data: interview });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Reschedule an interview
 * @route   PATCH /api/v1/interviews/:id/reschedule
 * @access  Private/Recruiter
 */
exports.rescheduleInterview = async (req, res, next) => {
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

        // 📅 Update Google Calendar
        if (interview.calendar_provider === 'GOOGLE' && interview.external_event_id) {
            const recruiter = await Recruiter.findById(req.user._id).select('+calendar_tokens');
            if (recruiter && recruiter.calendar_tokens) {
                try {
                    const scheduledAt = new Date(interview.scheduled_at);
                    const endTime = new Date(scheduledAt.getTime() + interview.duration_minutes * 60000);
                    
                    await googleCalendar.updateEvent(recruiter.calendar_tokens, interview.external_event_id, {
                        summary: `RESCHEDULED: Interview: ${interview.job_id.title} - ${interview.student_id.name}`,
                        location: interview.location_details,
                        description: `Note: ${reason || 'Time updated'}`,
                        start: scheduledAt.toISOString(),
                        end: endTime.toISOString(),
                        attendees: [
                            { email: interview.student_id.email },
                            { email: recruiter.email }
                        ]
                    });
                } catch (calErr) {
                    logger.error(`Calendar Reschedule Failed: ${calErr.message}`);
                }
            }
        }

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
        next(err);
    }
};

/**
 * @desc    Student responds to interview (CONFIRM/REJECT)
 * @route   PUT /api/v1/interviews/:id/respond
 * @access  Private/Student
 */
exports.respondToInterview = async (req, res, next) => {
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
        next(err);
    }
};

/**
 * @desc    Recruiter updates interview status (COMPLETED/CANCELED)
 * @route   PUT /api/v1/interviews/:id/status
 * @access  Private/Recruiter
 */
exports.updateInterviewStatus = async (req, res, next) => {
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

        // 📅 Delete Google Calendar Event on Cancellation
        if (status === 'CANCELED' && interview.calendar_provider === 'GOOGLE' && interview.external_event_id) {
            const recruiter = await Recruiter.findById(req.user._id).select('+calendar_tokens');
            if (recruiter && recruiter.calendar_tokens) {
                try {
                    await googleCalendar.deleteEvent(recruiter.calendar_tokens, interview.external_event_id);
                } catch (calErr) {
                    logger.error(`Calendar Delete Failed: ${calErr.message}`);
                }
            }
        }

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
        next(err);
    }
};

/**
 * @desc    Get all interviews for current user (handles both Recruiter and Student)
 * @route   GET /api/v1/interviews
 * @access  Private
 */
exports.getMyInterviews = async (req, res, next) => {
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
        next(err);
    }
};

/**
 * @desc    Get room details and authorize join for a video interview
 * @route   GET /api/v1/interviews/:id/join
 * @access  Private (Participant only)
 */
exports.enterInterviewRoom = async (req, res, next) => {
    try {
        const interview = await Interview.findById(req.params.id)
            .populate('job_id', 'title company_name')
            .populate('student_id', 'name email profile_image_url')
            .populate('recruiter_id', 'name company_name');

        if (!interview) {
            return res.status(404).json({ success: false, message: 'Interview not found' });
        }

        // Authorization check
        const isParticipant = 
            interview.student_id._id.toString() === req.user._id.toString() || 
            interview.recruiter_id._id.toString() === req.user._id.toString();

        if (!isParticipant) {
            return res.status(403).json({ success: false, message: 'Not authorized to join this interview' });
        }

        if (interview.location_type !== 'VIRTUAL') {
            return res.status(400).json({ success: false, message: 'This is not a virtual interview' });
        }

        // Check if the interview is for today (allow 30 min early entry)
        const now = new Date();
        const scheduledTime = new Date(interview.scheduled_at);
        const diff = scheduledTime - now;

        if (diff > 30 * 60 * 1000 && config.get('env') !== 'development') {
            return res.status(400).json({ 
                success: false, 
                message: `You can only join 30 minutes before the scheduled time (${scheduledTime.toLocaleTimeString()})`
            });
        }

        res.status(200).json({
            success: true,
            data: {
                room_id: interview.internal_room_id,
                job_title: interview.job_id.title,
                student_name: interview.student_id.name,
                recruiter_name: interview.recruiter_id.name,
                scheduled_at: interview.scheduled_at,
                duration: interview.duration_minutes
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Student books an available slot
 * @route   POST /api/v1/interviews/slots/:id/book
 * @access  Private/Student
 */
exports.bookSlot = async (req, res, next) => {
    try {
        const { application_id } = req.body;

        const slot = await InterviewSlot.findById(req.params.id);
        if (!slot || slot.is_booked) {
            return res.status(400).json({ success: false, message: 'Slot is no longer available' });
        }

        const application = await Application.findById(application_id)
            .populate('job_id')
            .populate('student_id', 'name email');

        if (!application || application.student_id._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized for this application' });
        }

        // Create the interview
        const interview = await Interview.create({
            application_id,
            student_id: req.user._id,
            job_id: slot.job_id,
            recruiter_id: slot.recruiter_id,
            scheduled_at: slot.start_time,
            duration_minutes: Math.round((slot.end_time - slot.start_time) / 60000),
            location_type: 'VIRTUAL', // Default for self-booked slots
            location_details: 'Virtual Meeting Room',
            status: 'CONFIRMED', // Auto-confirmed because student picked it
            internal_room_id: uuidv4()
        });

        // Mark slot as booked
        slot.is_booked = true;
        slot.application_id = application_id;
        await slot.save();

        // Update Application Status to INTERVIEW
        application.status = 'INTERVIEW';
        await application.save();

        // 📅 Google Calendar Sync
        const recruiter = await Recruiter.findById(slot.recruiter_id).select('+calendar_tokens');
        if (recruiter && recruiter.calendar_tokens) {
            try {
                const eventData = await googleCalendar.createEvent(recruiter.calendar_tokens, {
                    summary: `Interview: ${application.job_id.title} - ${application.student_id.name}`,
                    location: interview.location_details,
                    description: `Automated booking via Placement Management System.`,
                    start: slot.start_time.toISOString(),
                    end: slot.end_time.toISOString(),
                    attendees: [
                        { email: application.student_id.email },
                        { email: recruiter.email }
                    ]
                });

                interview.calendar_provider = 'GOOGLE';
                interview.external_event_id = eventData.id;
                interview.meeting_link = eventData.hangoutLink || eventData.conferenceData?.entryPoints?.[0]?.uri || null;
                await interview.save();
            } catch (calErr) {
                logger.error(`Calendar Sync Failed: ${calErr.message}`);
            }
        }

        // Notify Recruiter
        await dispatchToUser({
            recipientId: slot.recruiter_id,
            recipientModel: 'Recruiter',
            eventName: 'interview_booked',
            title: 'New Interview Booked',
            message: `${application.student_id.name} has booked a slot for ${application.job_id.title}.`,
            type: 'SUCCESS',
            link: `/interviews/${interview._id}`
        });

        res.status(201).json({ success: true, data: interview });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Submit interview feedback
 * @route   POST /api/v1/interviews/:id/feedback
 * @access  Private/Recruiter
 */
exports.submitFeedback = async (req, res, next) => {
    try {
        const { scores, comments, recommendation } = req.body;

        const interview = await Interview.findById(req.params.id);
        if (!interview) {
            return res.status(404).json({ success: false, message: 'Interview not found' });
        }

        if (interview.recruiter_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const feedback = await InterviewFeedback.create({
            interview_id: interview._id,
            recruiter_id: req.user._id,
            student_id: interview.student_id,
            scores,
            comments,
            recommendation
        });

        // Mark interview as completed
        interview.status = 'COMPLETED';
        await interview.save();

        // Optional: Update Application based on recommendation?
        // For now, keeping it as INTERVIEW until explicit recruiter action in Application view
        // unless we want to automate 'SELECTED' for 'HIRE'.
        const application = await Application.findById(interview.application_id);
        if (application && recommendation === 'HIRE') {
            // application.status = 'SELECTED'; // Auto-select? Maybe too aggressive.
            // Let's just log it for now.
        }

        await Log.create({
            user_id: req.user._id, user_role: 'RECRUITER',
            action: 'SUBMIT_FEEDBACK', target_id: feedback._id
        });

        res.status(201).json({ success: true, data: feedback });
    } catch (err) {
        next(err);
    }
};
