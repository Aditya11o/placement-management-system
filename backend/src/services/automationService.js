const cron = require('node-cron');
const Interview = require('../models/Interview');
const Job = require('../models/Job');
const Student = require('../models/Student');
const { emailQueue } = require('../utils/emailQueue');
const logger = require('../utils/logger');
const moment = require('moment');

/**
 * Automation Service handles background cron jobs and automated workflows.
 */
const initAutomationService = () => {
    // 1. Daily Interview Reminder (Runs at 8:00 AM)
    // Logic: Find confirmed interviews scheduled for the next 24 hours.
    cron.schedule('0 8 * * *', async () => {
        try {
            logger.info('[Automation] Running daily interview reminder cron...');
            
            const startOfTomorrow = moment().add(1, 'day').startOf('day').toDate();
            const endOfTomorrow = moment().add(1, 'day').endOf('day').toDate();

            const upcomingInterviews = await Interview.find({
                status: 'CONFIRMED',
                scheduled_at: { $gte: startOfTomorrow, $lte: endOfTomorrow }
            }).populate('student_id', 'name email').populate('job_id', 'title company_name');

            logger.info(`[Automation] Found ${upcomingInterviews.length} interviews for tomorrow.`);

            for (const interview of upcomingInterviews) {
                if (interview.student_id?.email) {
                    await emailQueue.add('interview-reminder', {
                        email: interview.student_id.email,
                        subject: `Reminder: Interview with ${interview.job_id.company_name} Tomorrow`,
                        template: 'generic',
                        context: {
                            name: interview.student_id.name,
                            body: `This is a reminder for your ${interview.type} interview for the "${interview.job_id.title}" role.`,
                            companyName: interview.job_id.company_name,
                            time: moment(interview.scheduled_at).format('MMMM Do YYYY, h:mm a'),
                            location: interview.location_details,
                            meetingLink: interview.meeting_link
                        }
                    });
                }
            }
        } catch (err) {
            logger.error(`[Automation] Interview Reminder Cron Error: ${err.message}`);
        }
    });

    // 2. Weekly Placement Summary for TPOs (Monday at 9:00 AM) - Optional but good for efficiency
    cron.schedule('0 9 * * 1', async () => {
        // Implementation for weekly reports can go here
    });

    logger.info('[Automation] Automation service initialized (crons scheduled).');
};

/**
 * Automated New Job Alert
 * Triggered when a new job is approved.
 * @param {Object} job - The approved Job document
 */
const notifyNewJobAlerts = async (job) => {
    try {
        // Find students whose branch matches the job's eligible branch
        const eligibleStudents = await Student.find({
            status: 'APPROVED',
            branch: job.eligible_branch,
            cgpa: { $gte: job.min_cgpa || 0 }
        });

        logger.info(`[Automation] Sending job alerts for "${job.title}" to ${eligibleStudents.length} students.`);

        for (const student of eligibleStudents) {
            await emailQueue.add('job-alert', {
                email: student.email,
                subject: `New Opportunity: ${job.title} at ${job.company_name}`,
                template: 'generic',
                context: {
                    name: student.name,
                    body: `A new job matching your profile has been posted: "${job.title}" by ${job.company_name}. Check it out on the portal!`,
                    jobTitle: job.title,
                    companyName: job.company_name,
                    package: `${job.package_lpa} LPA`,
                    deadline: moment(job.deadline).format('MMMM Do, YYYY')
                }
            });
        }
    } catch (err) {
        logger.error(`[Automation] Job Alert Error: ${err.message}`);
    }
};

module.exports = { initAutomationService, notifyNewJobAlerts };
