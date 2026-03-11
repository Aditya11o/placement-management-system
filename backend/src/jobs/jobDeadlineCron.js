const cron = require('node-cron');
const Job = require('../models/Job');
const { dispatchToUser } = require('../services/notifyDispatcher');

/**
 * Job Lifecycle Cron
 * - Closes expired jobs every hour
 * - Sends 24h deadline reminders to recruiters
 */
const initJobDeadlineCron = () => {
    // Run every hour at minute 0
    cron.schedule('0 * * * *', async () => {
        try {
            const now = new Date();
            // 1. AUTO-CLOSE EXPIRED JOBS
            const expiredJobs = await Job.find({
                status: 'ACTIVE',
                deadline: { $lt: now }
            });

            if (expiredJobs.length > 0) {
                console.log(`[CRON] Found ${expiredJobs.length} expired jobs. Closing them.`);

                // Update them to CLOSED
                const jobIds = expiredJobs.map(job => job._id);
                await Job.updateMany(
                    { _id: { $in: jobIds } },
                    { $set: { status: 'CLOSED' } }
                );

                console.log(`[CRON] Successfully closed ${jobIds.length} jobs.`);
            }

            // 2. SEND DEADLINE REMINDERS (Jobs expiring in 24-25 hours)
            const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            const tomorrowEnd = new Date(tomorrow.getTime() + 60 * 60 * 1000); // 1 hour window

            const upcomingDeadlines = await Job.find({
                status: 'ACTIVE',
                deadline: { $gte: tomorrow, $lt: tomorrowEnd }
            });

            if (upcomingDeadlines.length > 0) {
                console.log(`[CRON] Found ${upcomingDeadlines.length} jobs expiring in 24h. Notifying recruiters.`);
                
                for (const job of upcomingDeadlines) {
                    await dispatchToUser({
                        recipientId: job.recruiter_id,
                        recipientModel: 'Recruiter',
                        eventName: 'job_deadline_approaching',
                        title: '⚠️ Job Deadline Approaching',
                        message: `The deadline for your job posting "${job.title}" is in 24 hours. Review your applicants now!`,
                        type: 'WARNING',
                        link: `/jobs/${job._id}/applicants`,
                        metadata: { job_id: job._id }
                    });
                }
            }
        } catch (error) {
            console.error('[CRON ERROR] jobDeadlineCron failed:', error);
        }
    });
};

module.exports = initJobDeadlineCron;
